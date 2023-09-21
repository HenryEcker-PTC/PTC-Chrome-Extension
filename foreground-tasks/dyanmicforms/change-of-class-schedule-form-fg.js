const inputIdMap = {
    pNumberInput: 16626709,
    firstNameInput: 16626705,
    lastNameInput: 16626707,
    cellPhoneNumber: 16626713
};

const selectIdMap = {
    termSelect: 16669665
}

const checkboxIdMap = {
    dropCheckbox: 16627776
}

const dropClassFields = {
    16627902: {
        subjectCourse: 16627899,
        section: 16627901
    },
    16627906: {
        subjectCourse: 16627903,
        section: 16627905
    },
    16627910: {
        subjectCourse: 16627907,
        section: 16627909
    },
    16627914: {
        subjectCourse: 16627911,
        section: 16627913
    },
    16627918: {
        subjectCourse: 16627915,
        section: 16627917
    }
}

const sendRequestForChangeOfMajorDetails = (value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
                action: 'request_change_of_schedule_form_details',
                from: 'foreground',
                pNumber: value
            },
            async (res) => {
                if (chrome.runtime.lastError) {
                    console.error('Error');
                }
                if (res.success === true) {
                    const {
                        firstName,
                        lastName,
                        cellPhone
                    } = res.data;
                    // First Name
                    void await doInputValue(inputIdMap.firstNameInput, firstName, 'change');
                    // Last Name
                    void await doInputValue(inputIdMap.lastNameInput, lastName, 'change');
                    // Cell Phone
                    doCellPhoneInput(getInputItem(inputIdMap.cellPhoneNumber), cellPhone);
                    // Select Term
                    void await chooseSelectSecondOption(selectIdMap.termSelect);
                    resolve();
                } else {
                    reject(res);
                }
            }
        );
    });
};


const pNumberChangeHandler = async (ev) => {
    ev.preventDefault();
    try {
        const value = ev.target.value.toUpperCase().trim();
        if (value.length === 0) {
            return undefined;
        }
        await sendRequestForChangeOfMajorDetails(value);
    } catch (e) {
        if (Object.hasOwn(e, 'message')) {
            if (window.confirm(e.message)) {
                window.location.reload();
            }
        }
    } finally {
        propDisable(getInputItem(inputIdMap.firstNameInput), false);
        propDisable(getInputItem(inputIdMap.lastNameInput), false);
    }
};


const sendRequestForClassDetails = (value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
                action: 'request_student_class_details',
                from: 'foreground',
                pNumber: value
            },
            async (res) => {
                if (chrome.runtime.lastError) {
                    console.error('Error');
                }
                if (res.success === true) {
                    resolve(res.data);
                } else {
                    reject(res);
                }
            }
        );
    });
};

const dropClassChangeHandler = async (ev) => {
    const isChecked = ev.target.checked;

    const value = getInputItem(inputIdMap.pNumberInput).value.toUpperCase().trim();
    if (!isChecked || value.length === 0) {
        return undefined;
    }
    try {
        for (const [crnFieldId, {subjectCourse, section}] of Object.entries(dropClassFields)) {
            propDisable(getInputItem(crnFieldId), true);
            propDisable(getInputItem(subjectCourse), true);
            propDisable(getInputItem(section), true);
        }
        const classInfo = await sendRequestForClassDetails(value);
        for (const [crnFieldId, {subjectCourse, section}] of Object.entries(dropClassFields)) {
            getInputItem(crnFieldId).addEventListener('blur', async (crnInputEv) => {
                try {
                    const crnValue = crnInputEv.target.value.toUpperCase().trim();

                    if (value.length === 0) {
                        return undefined;
                    }

                    const course = classInfo[crnValue];
                    if (course === undefined) {
                        alert('No entry with that value found in student\'s course history');
                        return;
                    }

                    void await doInputValue(subjectCourse, `${course.subject}-${course.number}`, 'change');
                    void await doInputValue(section, course.section, 'change');
                } finally {
                    propDisable(getInputItem(subjectCourse), false);
                    propDisable(getInputItem(section), false);
                }
            });
        }
    } catch (_) {
        alert('Something went wrong fetching classes!');
    } finally {
        for (const crnFieldId of Object.keys(dropClassFields)) {
            propDisable(getInputItem(crnFieldId), false);
        }
    }
}


(function () {
    // Disable these to indicate filling PNumber
    propDisable(getInputItem(inputIdMap.firstNameInput), true);
    propDisable(getInputItem(inputIdMap.lastNameInput), true);
    // Add Event Listener
    getInputItem(inputIdMap.pNumberInput).addEventListener('input', pNumberChangeHandler);
    getInputItem(checkboxIdMap.dropCheckbox).addEventListener('change', dropClassChangeHandler);
})();