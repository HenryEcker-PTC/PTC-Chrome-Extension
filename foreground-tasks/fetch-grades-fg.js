const mountSelector = '#title-panel'
const myInputFieldId = "d2lIDInputField"
const searchBox = '#search'

const handleInputFieldChange = (crn) => (ev) => {
    document.getElementById(myInputFieldId).value = ev.target.value;
    // Select the course from list (by CRN)
    const search = $(searchBox);
    search.val(crn);
    search[0].dispatchEvent(new Event("change"));
};

function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');

    return month + '/' + day + '/' + year;
}

const fetchGrades = (ev) => {
    ev.preventDefault();
    const finalGrade = window.location.hash.split('/').pop() === 'final'
    chrome.runtime.sendMessage({
        action: 'fetch_grades',
        from: 'foreground',
        d2lid: document.getElementById(myInputFieldId).value,
        isFinal: finalGrade
    }, (res) => {
        console.log(res); // Should log
        // const expectedElementCount = finalGrade ? 12 : 10;
        // let trs = $(dataTableSelector).find('tr');
        // trs = trs.filter((i, e) => $(e)[0].childElementCount === expectedElementCount);
        // trs.each((i, e) => {
        //     const td = $(e).find('td');
        //     const pNum = td.eq(2).text();
        //     if (pNum) {
        //         if (pNum in res) {
        //             td.eq(5).find('select').val(res[pNum].score);
        //             if (finalGrade && res[pNum].score === "F") {
        //                 td.eq(7).find('input').val(getFormattedDate(new Date(res[pNum].lastDate)));
        //             }
        //         }
        //     }
        // });
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

const formStyles = "height: 100%;min-height: unset !important;display: flex;flex-wrap: nowrap;flex-direction: column;gap: 5px;margin: 10px;";
// Build Form
const newStructure = $(`<form id="importer-form" class="component-content" style="${formStyles}">
    <h2>Current Pinned Courses:</h2>
    <div id="mount_pnt" class="radio-container">
    </div>

    <div>
        <div>
            <label for="${myInputFieldId}">D2L OrgUnit Id:</label>
        </div>
        <div>
            <input id="${myInputFieldId}"/>
        </div>
    </div>
    <div>
        <button id="fetchBtn" type="submit">Fetch Grades</button>
    </div>
</form>`);
// Submit Handler
newStructure.on('submit', fetchGrades)
// Div to Add
const div = $('<div class="component-top"></div>')
div.append($('<div class="app-header"><h2 style="margin: 10px;">Easy Import Grades</h2></div>'))
div.append(newStructure);

// Find a better way to have this run when page has finished loading
setTimeout(() => {
    $(mountSelector).after(div);
    // Ask for pinned courses list
    chrome.runtime.sendMessage({
        action: 'fetch_pinned_courses', from: 'foreground'
    }, (res) => {
        const mount_pnt = document.getElementById("mount_pnt");
        if (res.success) {
            const div = $(mount_pnt);
            res.pinnedCourses.forEach(({id, name, code}) => {
                const [crn, term] = code.split('.');
                const row = $('<div></div>')
                const label = $(`<label for="${id}">${name.split(' - ')[0]}</label>`);
                const input = $(`<input id="${id}" type="radio" name="pinned_courses" value="${id}"/>`);
                input.on('change', handleInputFieldChange(crn));
                row.append(input);
                row.append(label);
                div.append(row);
            });
        } else {
            $(mount_pnt).append($('<p class="centered-colspan-container">No Courses matching search criteria were found.</p>'));
        }
    });
}, 500);
