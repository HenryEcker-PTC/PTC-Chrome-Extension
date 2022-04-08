const arrayToObject = (array, key) =>
    array.reduce((obj, item) => {
        obj[item[key]] = item;
        return obj;
    }, {});

const filterBlacklistedGradeTypes = (g) => {
    return g.hasOwnProperty('GradeType') && !["Calculated", "Text"].includes(g.GradeType);
};

const getGradeItems = (ou) => {
    return fetch(`/d2l/api/le/1.34/${ou}/grades/categories/`)
        .then(res => res.json())
        .then(categories => {
            const indexedCategories = categories.map((e) => {
                return {
                    'Name': e.Name,
                    'Id': e.Id,
                    'Grades': e.Grades.filter(filterBlacklistedGradeTypes).map((g) => {
                        return {
                            'Name': g.Name,
                            'Id': g.Id
                        };
                    })
                };
            });
            return fetch(`/d2l/api/le/1.34/${ou}/grades/`).then(res => res.json()).then(gItems => {
                const noCategory = gItems.filter((e) => e.CategoryId === 0 && filterBlacklistedGradeTypes(e))
                if (noCategory.length > 0) {
                    indexedCategories.push({
                        'Name': "No Category",
                        'Id': 0,
                        'Grades': noCategory
                    });
                }
                return indexedCategories;
            });
        });
};


const getStudents = (ou, gradeItems) => {
    return Promise.all(gradeItems.map(g => new Promise(function (resolve) {
        fetch(`/d2l/api/le/1.34/${ou}/grades/${g.Id}/values/?pageSize=200`).then((valuesRes) => {
            if (valuesRes.status !== 200) {
                throw new Error();
            }
            return valuesRes.json();
        }).then(valuesRes => {
            return fetch(`/d2l/api/le/1.34/${ou}/grades/${g.Id}/exemptions/`)
                .then(exemptionsRes => exemptionsRes.json())
                .then(exemptionsRes => {
                    const exemptionsObj = arrayToObject(exemptionsRes, 'Identifier');
                    resolve(valuesRes.Objects.map((e) => {
                            if (e.User.Identifier in exemptionsObj) {
                                return {
                                    studentIdentifier: e.User.Identifier,
                                    gradeItemId: g.Id,
                                    gradeItemName: g.Name,
                                    t: 'EXEMPT',
                                    a: true
                                };

                            } else if (e.GradeValue && e.GradeValue.PointsDenominator) {
                                const PointsNumerator = e.GradeValue.PointsNumerator;
                                const PointsDenominator = e.GradeValue.PointsDenominator;
                                const score = (PointsNumerator) ? (PointsNumerator / PointsDenominator) * 100 : 0;
                                return {
                                    studentIdentifier: e.User.Identifier,
                                    gradeItemId: g.Id,
                                    gradeItemName: g.Name,
                                    t: `${score.toFixed(2)} %`,
                                    a: PointsNumerator > 0
                                };
                            } else {
                                return {
                                    studentIdentifier: e.User.Identifier,
                                    gradeItemId: g.Id,
                                    gradeItemName: g.Name,
                                    t: 'UNSCORED',
                                    a: 'undefined'
                                };
                            }
                        })
                    );
                });
        });
    })));
};


class WindowBuilder {
    constructor(ou, root, indexedCategories) {
        this.ou = ou;
        this.root = root;
        this.attendanceCodeMap = {
            None: 0,
            P: 606,
            A: 607,
            T: 608,
            L: 825
        };
        this.indexedCategories = indexedCategories;
        this.d2lTable = $('th:contains(Attendance Status)').closest('table');
    }

    buildCheckList = () => {
        const div = $(`#${this.root}`);
        const gradeItemDiv = $(`<div id="grade-item-div"></div>`);
        this.indexedCategories.forEach((e) => {
            const qDiv = $(`<div id=${e.Id}></div>`);
            qDiv.append($(`<h2 class="subtitle">${e.Name}</h2>`));
            qDiv.append($('<hr/>'));

            const grade_items_table = $(`<table id="${e.Name.toLocaleLowerCase()}-grade-item-table"></table>`);
            grade_items_table.append($('<tr><th>Select</th><th>Grade Item Name</th></tr>'));
            e.Grades.forEach((g) => {
                const tr = $('<tr></tr>');
                const td = $(`<td><input type="checkbox" id="${g.Id}" value="${g.Id}"></td><td><label for="${g.Id}">${g.Name}</label></td>`);
                tr.append(td);
                grade_items_table.append(tr);
            });
            qDiv.append(grade_items_table);
            gradeItemDiv.append(qDiv);
        });

        div.append(gradeItemDiv);

        const fillAbsentButton = $('<button id="fill-absent-button" class="d2l-button" style="float:left;">Default Absent</button>');
        fillAbsentButton.click($.proxy(this.fillMissingAbsent, this));
        fillAbsentButton.insertAfter($('#z_a'));

        const processButton = $('<button id="compute-participation-button" class="d2l-button" style="float:left;">Compute Participation</button>');
        processButton.click($.proxy(this.handleItemSelection, this));
        processButton.insertAfter($('#z_a'));

    };

    computeParticipation() {
        $(this.d2lTable).find('tr:gt(0)').each((i, e) => {
            const cells = $(e).find('td.grid-data-cell');
            const participation = cells.map(function () {
                return $(this).attr('value');
            }).get();
            const compareTrue = (e) => e === 'true';

            let attendance;
            if (participation.includes("undefined")) {
                attendance = "None";
            } else if (participation.every(compareTrue)) {
                attendance = 'P';
            } else if (participation.some(compareTrue)) {
                attendance = 'T';
            } else {
                attendance = 'A';
            }
            const selectId = $(e).find('select').attr('id');
            const select = document.getElementById(selectId);
            select.value = this.attendanceCodeMap[attendance];
            select.dispatchEvent(new Event("change"));
        });
    }

    buildProcessTable = (res) => {
        const div = $(`#${this.root}`);
        div.empty();
        div.css("border", "unset");
        const backButton = $('<button id="compute-participation-button" class="d2l-button">Back To Selection</button>');
        backButton.click(() => {
            window.location.reload();
        });
        div.append(backButton);

        [...res].reverse().forEach(score => {
            if (score) {
                $(`<th>${score[0].gradeItemName.substring(0, 25)}</th>`).insertAfter(this.d2lTable.find('tr:eq(0) th:eq(1)'));
                score.forEach((e) => {
                    const id = `${e.studentIdentifier}-${e.gradeItemId}`;
                    $(`<td id="${id}" value="${e.a}" class="grid-data-cell">${e.t}</td>`).insertAfter($(`a[href*="${e.studentIdentifier}"]`).parent());
                });
            }
        });
        this.computeParticipation();
    };

    handleItemSelection = () => {
        this.getStudents($('#grade-item-div tr').map(function () {
            const checkboxRef = $(this).find('input[type=checkbox]');
            if (checkboxRef.is(':checked')) {
                return {
                    Id: checkboxRef.val(),
                    Name: $(this).find('label').text()
                };
            }
        }).get());
    };


    getStudents = (gradeItems) => {
        getStudents(this.ou, gradeItems).then((res) => {
            this.buildProcessTable(res);
        });
    };

    fillMissingAbsent = () => {
        $(this.d2lTable).find('tr:gt(0)').each((i, e) => {
            const selectId = $(e).find('select').attr('id');
            const select = document.getElementById(selectId);
            if (select.value === this.attendanceCodeMap['None'].toString()) {
                select.value = this.attendanceCodeMap['A'];
                select.dispatchEvent(new Event("change"));
            }
        });
    };
}

const buildWindow = (ou, indexedCategories, root) => {
    const builder = new WindowBuilder(
        ou,
        root,
        indexedCategories
    );
    builder.buildCheckList();

};

const ou = new URLSearchParams(window.location.search).get('ou');
getGradeItems(ou).then((res) => {
    const root = "d2l_attendance_from_participation_mount_point";
    $(`<div id="${root}"></div>`).insertBefore($('th:contains(Attendance Status)').closest('table'));
    buildWindow(ou, res, root);
});


