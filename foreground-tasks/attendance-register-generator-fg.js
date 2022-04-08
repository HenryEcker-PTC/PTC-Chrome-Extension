chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'write_meetings_arg' && request.from === 'popup') {
        writeMeetings(request.dates, sendResponse);
    }
    return true;
});

const fillTableRows = (values) => {
    let l = values.length;
    let i = 0;
    $("table:eq(2) tr").each(function () {
        if (i >= l) {
            // Delete Unnecessary Rows
            const e = $(this).find("a[title*='Delete']");
            if (e[0]) {
                e[0].dispatchEvent(new Event("click"));
            }
        } else {
            // Fill
            const e = $(this).find("a[title*='Restore']");
            if (e[0]) {
                e[0].dispatchEvent(new Event("click"));
            }
            $(this).find("input:text:eq(0)").each(function () {
                $(this)[0].value = values[i];
                i++;
            });
        }
    });
};


const writeMeetings = (results, sendResponse) => {
    const num_rows = $("table:eq(2) tr").length - 1;
    const num_needed = results.length;
    const button = $("a:contains(Add Sessions)");
    if (num_needed > num_rows) {
        let to_add = num_needed - num_rows;
        if (to_add > 100) {
            to_add = 100; // D2L Only allows 100 sessions to be added at a time.
        }
        sendResponse({needed_to_add: to_add});
        button.next("d2l-input-number")[0].setAttribute('value', to_add);
        button[0].dispatchEvent(new Event("click"));
        return;
    }
    fillTableRows(results);
    sendResponse({needed_to_add: 0});
};