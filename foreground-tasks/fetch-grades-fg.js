const dataTableSelector = 'table.dataentrytable'
const myInputFieldId = "d2lIDInputField"

const updateInputField = (ev) => {
    document.getElementById(myInputFieldId).value = ev.target.value;
};

function convertToTermCode(name) {
    let [semester, year] = name.split(' ');
    let code = 0;
    switch (semester.toLocaleLowerCase()) {
        case "fall":
            code = 10;
            break;
        case "spring":
            year -= 1;
            code = 20;
            break;
        case "summer":
            year -= 1;
            code = 30;
            break;
        default:
            throw Error("Invalid Semester");
    }
    return `${year}${code}`;
}


function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');

    return month + '/' + day + '/' + year;
}

const fetchGrades = (ev) => {
    ev.preventDefault();
    const finalGrade = new RegExp("/PROD/(bwlkffgd.P_Fac(Commit)?FinGrd*)").test(window.location.pathname)
    chrome.runtime.sendMessage({
        action: 'fetch_grades',
        from: 'foreground',
        d2lid: document.getElementById(myInputFieldId).value,
        isFinal: finalGrade
    }, (res) => {
        console.log(res); // Should log
        const expectedElementCount = finalGrade ? 12 : 10;
        let trs = $(dataTableSelector).find('tr');
        trs = trs.filter((i, e) => $(e)[0].childElementCount === expectedElementCount);
        trs.each((i, e) => {
            const td = $(e).find('td');
            const pNum = td.eq(2).text();
            if (pNum) {
                if (pNum in res) {
                    td.eq(5).find('select').val(res[pNum].score);
                    if (finalGrade && res[pNum].score === "F") {
                        td.eq(7).find('input').val(getFormattedDate(new Date(res[pNum].lastDate)));
                    }
                }
            }
        });
        const success = !(res && Object.keys(res).length === 0);
        const d2lIDinput = document.getElementById(myInputFieldId);
        if (success) {
            d2lIDinput.value = '';
            d2lIDinput.placeholder = '';
        } else {
            d2lIDinput.value = '';
            d2lIDinput.placeholder = 'No Grades found at that ID';
        }
    });
};

// Build Form
const newStructure = $(`<form id="importer-form">
    <h1 class="title">Import From D2L</h1>
    <h2 class="subtitle">Current Pinned Courses:</h2>
    <div id="mount_pnt" class="radio-container">
    </div>

    <div class="input-container">
        <div>
            <label for="${myInputFieldId}">D2L OrgUnit Id:</label>
        </div>
        <div>
            <input id="${myInputFieldId}"/>
        </div>
    </div>
    <div class="btn-container">
        <button id="fetchBtn" type="submit">Fetch Grades</button>
    </div>
</form>`);
// Submit Handler
newStructure.on('submit', fetchGrades)
// Div to Add
const div = $('<div class="complete-container-fg"></div>')
div.append($('<h2 class="captiontext">Easy Import Grades</h2>'))
div.append(newStructure);
// Place Before DataTable
div.insertBefore($(dataTableSelector));

// Ask for pinned courses list
chrome.runtime.sendMessage({
    action: 'fetch_pinned_courses', from: 'foreground'
}, (res) => {
    const mount_pnt = document.getElementById("mount_pnt");
    if (res.success) {
        const crn = $("table.datadisplaytable td.dddefault:eq(0)").text();
        const sh = $('div.staticheaders').text().split('\n');
        const term = convertToTermCode(sh[2]);
        const potential_code = `${crn}.${term}`;
        const div = $(mount_pnt);
        res.pinnedCourses.forEach(({id, name, code}) => {
            const label = $(`<label for="${id}">${name.split(' - ')[0]}</label>`);
            const input = $(`<input id="${id}" type="radio" name="pinned_courses" value="${id}"/>`);
            input.on('change', updateInputField);
            if (code === potential_code) {
                input.prop('checked', true);
                updateInputField({target: {value: id}});
            }
            div.append(input);
            div.append(label);
        });
    } else {
        $(mount_pnt).append($('<p class="centered-colspan-container">No Courses matching search criteria were found.</p>'));
    }
});
