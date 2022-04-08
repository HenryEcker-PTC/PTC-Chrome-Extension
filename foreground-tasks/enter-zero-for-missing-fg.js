const setZero = (ev) => {
    ev.preventDefault();
    $('th:contains(Grade)').parent().parent()// tbody element above Grade Header
        .find('tr:gt(0)')// Skip Header Row
        .find('d2l-input-number')//  input text field
        .each((i, e) => {
            if (!e.getAttribute('value')) {
                e.setAttribute('value', 0);
            }
        });
};


const newButton = $('<button type="button" class="d2l-button" id="z_a2" style="float:left;">Fill Missing</button>');
newButton.insertAfter($('#z_a'));
newButton.on('click', setZero);
