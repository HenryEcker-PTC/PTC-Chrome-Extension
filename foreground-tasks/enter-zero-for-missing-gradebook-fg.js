const setZeroAll = (ev) => {
    ev.preventDefault();
    $('table.d2l-table.d2l-grid.d_gd') // GradeBook Table
        .find('d2l-input-number:not([title^="Final Adjusted Grade"])')//  input text field (excludes final adjusted column)
        .each((i, e) => {
            if (!e.getAttribute('value')) {
                e.setAttribute('value', 0);
            }
        });
};

// Only render for spreadsheet view
if ($('#BTN_ViewToggle').text() === 'Switch to Standard View') {
    const newButton = $('<button type="button" class="d2l-button" id="z_a2" style="float:left;">Fill Missing</button>');
    newButton.insertAfter($('#z_a'));
    newButton.on('click', setZeroAll);
}
