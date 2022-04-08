const adjustGrades = (ev) => {
    ev.preventDefault();
    const trs = $('table').eq(9).find('tr').filter((i, e) => (e.childElementCount === 8));
    if (trs) {
        chrome.storage.sync.get(['isAdjusted'], response => {
            let percents = trs.map((i, e) => parseFloat($(e).find("label").eq(2).text()));
            if (response.isAdjusted) {
                const curve = 100 - Math.max(...percents);
                percents = percents.map((i, e) => Math.round(e + curve));
            } else {
                percents = percents.map((i, e) => Math.round(e));
            }
            trs.map((i, e) => $(e).find('d2l-input-number')).each((i, e) => {
                e[0].setAttribute('value', percents[i]); // numerators
                e[1].setAttribute('value', 100); // denominators
            });
        });
    } else {
        alert("Something went wrong. Please contact administrator!");
    }
};


const newButton = $('<button type="button" class="d2l-button" id="z_a2" style="float:left;">Set Adjusted</button>');
newButton.insertAfter($('#z_a'));
newButton.on('click', adjustGrades);