const convertToMoment = (m) => {
    return moment(new Date(m)).utcOffset(0, true);
};

const convertToDateTime = (d) => {
    return {value: d.toISOString(), display: d.format('MM/DD/YYYY hh:mm a')};
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'write_meetings_arg' && request.from === 'popup') {
        sendResponse({needed_to_add: 0});
        console.log(request);
        const startDates = [
            convertToMoment(request.startDate),
            convertToMoment(request.dates[0]),
            ...request.dates.slice(1).map(m => convertToMoment(m).add(1, 'days'))
        ];
        const endDates = [
            ...request.dates.slice(1).map(m => convertToMoment(m).add(23, 'hours').add(59, 'minutes')),
            convertToMoment(request.endDate).add(23, 'hours').add(59, 'minutes')
        ];
        buildSelects(startDates.map(convertToDateTime), endDates.map(convertToDateTime));
    }
    return true;
});


const addSelects = (dates, dateType) => function () {
    const select = $(`<select class="my-select-dates-updater" dateType="${dateType}"></select>`);
    select.append($(`<option value=""></option>`));
    dates.forEach((datetime) => {
        select.append($(`<option value="${datetime.value}">${datetime.display}</option>`))
    });
    $(this).append(select);
};

const buildSelects = (startDates, endDates) => {
    const trs = $('#z_cl_c tbody').find('tr[role=row]');

    const due_col = trs.find('td:eq(3)');
    const start_col = trs.find('td:eq(4)');
    const end_col = trs.find('td:eq(5)');
    start_col.each(addSelects(startDates, 4));
    end_col.each(addSelects(endDates, 5));
    due_col.each(addSelects(endDates, 3));
    addApplyButton();
};


const addApplyButton = () => {
    const li = $('<li class="float_l" style="display: inline;"></li>');
    const button = $(`<d2l-button-subtle dir="ltr" type="button" text="Apply Dates" data-js-focus-visible=""></d2l-button-subtle>`);
    button.on('click', applyDates);
    li.append(button);
    $('d2l-button-subtle').last().closest('ul').append(li);
};

const waitForAttach = (cb) => {
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
        let x = new MutationObserver(function (e) {
            if (e[0].removedNodes) {
                resolve();
            }
        });
        x.observe(document.body, {childList: true});
        $('button:contains(Save)').click();
    });
};


const changeDate = (iframe, checkboxId, dateSelectorId, new_date) => {
    const cb = iframe.contents().find(checkboxId);
    cb.prop("checked", true);
    cb[0].dispatchEvent(new Event('change'));
    const df = iframe.contents().find(dateSelectorId);
    df.attr('value', new_date);
    df[0].dispatchEvent(new Event('change'));
};


const applyDates = async (ev) => {
        ev.preventDefault();

        const trs = $('#z_cl_c tbody').find('tr[role=row]');
        let actionItems = {};
        for (let j = 0; j < trs.length; j++) {
            $(trs[j]).find('.my-select-dates-updater').each((i, e) => {
                let new_date = $(e).val();
                if (new_date) {
                    new_date = new_date.slice(0, -1);
                    const type = $(e).attr('dateType');
                    let inclusion = {};
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

                    actionItems[j] = {
                        ...actionItems[j],
                        ...inclusion
                    }
                }
            });
        }

        for (let [row, values] of Object.entries(actionItems)) {
            if (values.dueDate) {
                const b = $(values.dueElem).parent().find('div.yui-dt-liner a');
                if (b[0]) {
                    b[0].dispatchEvent(new Event("click"));
                    const iframe = await waitForAttach();
                    changeDate(iframe, '#z_j', '#z_k', values.dueDate);
                }

                await delayedSave();
            }
            if (values.endDate || values.startDate) {
                const b = $(values.accessElem).parent().find('div.yui-dt-liner a');
                if (b[0]) {
                    b[0].dispatchEvent(new Event("click"));
                    const iframe = await waitForAttach();
                    if (values.endDate) {
                        changeDate(iframe, '#z_q', '#z_r', values.endDate);
                    }
                    if (values.startDate) {
                        changeDate(iframe, '#z_n', '#z_o', values.startDate);
                    }
                }

                await delayedSave();
            }
        }

        $('.my-select-dates-updater').val('');
    }
;
