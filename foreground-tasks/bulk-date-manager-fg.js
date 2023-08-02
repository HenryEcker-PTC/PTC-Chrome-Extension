const getBulkDateManagerTrs = () => {
    return $('#z_cl_c tbody:eq(1)').find('tr[role=row]');
};

const convertToMoment = (m) => {
    return moment(new Date(m)).utcOffset(0, true);
};

const convertToDateTime = (d) => {
    return {raw: d, value: d.toISOString(), display: d.format('MM/DD/YYYY hh:mm a')};
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'write_meetings_arg' && request.from === 'popup') {
        sendResponse({needed_to_add: 0});
        const startDates = [
            convertToMoment(request.startDate),
            ...request.dates.map((m) => {
                return convertToMoment(m).add(1, 'days');
            })
        ];
        const endDates = [
            ...request.dates.map((m) => {
                return convertToMoment(m).add(23, 'hours').add(59, 'minutes');
            }),
            convertToMoment(request.endDate).add(23, 'hours').add(59, 'minutes')
        ];
        buildSelects(startDates.map(convertToDateTime), endDates.map(convertToDateTime));
    }
    return true;
});


const buildSelect = (dates, dateType) => {
    const select = $(`<select class="my-select-dates-updater" dateType="${dateType}"></select>`);
    select.append($('<option value=""></option>'));
    dates.forEach((datetime) => {
        select.append($(`<option value="${datetime.value}">${datetime.display}</option>`));
    });
    return select;
};

const findFirstDateAfter = (dates, search) => {
    for (const d of dates) {
        if (d.raw >= search) {
            return d.value;
        }
    }
    // Default to last value
    return dates[dates.length - 1].value;
};


class EntryController {
    constructor(startDates, endDates) {
        this.startDateSelect = buildSelect(startDates, 4);

        this.dueDateSelect = buildSelect(endDates, 3);

        this.endDateSelect = buildSelect(endDates, 5);
        this.endDateBoundCheckbox = $('<input type="checkbox"/>');

        this.windowLengthInput = $('<input type="number" min="0" step="1"/>');
        this.windowLengthInput.val(7);

        this.windowLengthInput.on('change', () => {
            this._updateEndDate(endDates);
        });

        this.endDateBoundCheckbox.on('change', (ev) => {
            this.endDateSelect.prop('disabled', ev.target.checked);
            this._updateEndDate(endDates);
        });

        this.startDateSelect.on('change', () => {
            this._updateEndDate(endDates);
        });
    }

    _getWindowLength() {
        const v = this.windowLengthInput.val();
        if (v.length === 0) {
            return undefined;
        }
        return Number(v);
    }

    _updateEndDate(endDates) {
        if (this.endDateBoundCheckbox.prop('checked')) {
            const startDateValue = this.startDateSelect.val();
            const offset = this._getWindowLength();
            if (startDateValue.length > 0 && offset !== undefined) {
                const m = moment(new Date(startDateValue));
                const dValue = findFirstDateAfter(endDates, m.add(offset - 1, 'days'));
                this.endDateSelect.val(dValue);
            } else {
                this.endDateSelect.val('');
            }
        }
    }


    attachComponentToRow(tr) {
        tr.find('td:eq(3)').append(this.dueDateSelect);
        tr.find('td:eq(4)').append(this.startDateSelect);
        tr.find('td:eq(5)').append(
            $('<div style="display:flex;gap:10px;"></div>')
                .append(this.endDateBoundCheckbox)
                .append(this.endDateSelect)
        );
        tr.find('td:eq(6)').append(this.windowLengthInput);
    }
}

const buildSelects = (startDates, endDates) => {
    getBulkDateManagerTrs()
        .each((i, e) => {
            const ec = new EntryController(startDates, endDates);
            ec.attachComponentToRow($(e));
        });
    $('d2l-button-subtle')
        .last()
        .closest('ul')
        .append(buildApplyButtonComponent());
};


const buildApplyButtonComponent = () => {
    const li = $('<li class="float_l" style="display: inline;"></li>');
    const button = $('<d2l-button-subtle dir="ltr" type="button" text="Apply Dates" data-js-focus-visible=""></d2l-button-subtle>');
    button.on('click', applyDates);
    li.append(button);
    return li;
};

const waitForAttach = () => {
    let i = 0;
    return new Promise((resolve) => {
        $('iframe').on('load', function () {
            if (i > 0) {
                resolve($(this));
            }
            i += 1;
        });
    });
};

const delayedSave = async () => {
    return new Promise((resolve) => {
        const x = new MutationObserver(function (e) {
            if (e[0].removedNodes) {
                setTimeout(resolve, 200);
            }
        });
        x.observe(document.body, {childList: true});
        $('button:contains(Save)').click();
    });
};


const changeDate = (iframe, checkboxId, dateSelectorId, new_date) => {
    const cb = iframe.contents().find(checkboxId);
    cb.prop('checked', true);
    cb[0].dispatchEvent(new Event('change'));
    const df = iframe.contents().find(dateSelectorId);
    df.attr('value', new_date);
    df[0].dispatchEvent(new Event('change'));
};


const applyDates = async (ev) => {
    ev.preventDefault();

    const actionItems = getBulkDateManagerTrs().map((i, e) => {
        const tr = $(e);
        return {
            type: tr.find('td[headers*="Type"]').text(),
            ...tr.find('.my-select-dates-updater').toArray().reduce((acc, e) => {
                let new_date = $(e).val();
                if (new_date) {
                    new_date = new_date.slice(0, -1);
                    const type = $(e).attr('dateType');
                    const inclusion = {};
                    if (type === '3') {
                        inclusion['dueDate'] = new_date;
                        inclusion['dueElem'] = e;
                    } else if (type === '4') {
                        inclusion['startDate'] = new_date;
                        inclusion['accessElem'] = e;
                    } else if (type === '5') {
                        inclusion['endDate'] = new_date;
                        inclusion['accessElem'] = e;
                    }

                    acc = {
                        ...acc,
                        ...inclusion
                    };
                }
                return acc;
            }, {})
        };
    });

    for (const values of actionItems) {
        if (values.dueDate) {
            const b = $(values.dueElem).closest('td').find('div.yui-dt-liner a');
            if (b[0]) {
                b[0].dispatchEvent(new Event('click'));
                const iframe = await waitForAttach();
                changeDate(iframe, '#z_k', '#z_n', values.dueDate);
            }

            await delayedSave();
        }
        if (values.endDate || values.startDate) {
            const b = $(values.accessElem).closest('td').find('div.yui-dt-liner a');
            if (b[0]) {
                b[0].dispatchEvent(new Event('click'));
                const iframe = await waitForAttach();
                if (values.endDate) {
                    if (values.type === 'Discussion Topic') {
                        changeDate(iframe, '#z_v', '#z_w', values.endDate);
                    } else {
                        changeDate(iframe, '#z_r', '#z_s', values.endDate);
                    }
                }
                if (values.startDate) {
                    changeDate(iframe, '#z_o', '#z_p', values.startDate);
                }
            }

            await delayedSave();
        }
    }

    $('.my-select-dates-updater').val('');
};
