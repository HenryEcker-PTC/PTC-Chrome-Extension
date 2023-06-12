const inputIdMap = {
    pNumberInput: 16559572,
    firstNameInput: 16559568,
    lastNameInput: 16559570,
    cellPhoneNumber: 16559576
};

const sendRequestForSemesterWithdrawalForm = (value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
                action: 'request_semester_withdrawal_details',
                from: 'foreground',
                pNumber: value
            },
            async (res) => {
                if (chrome.runtime.lastError) {
                    console.error('Error');
                }
                if (res.success === true) {
                    console.log(res.data);
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
        console.log(value);
        if (value.length === 0) {
            return undefined;
        }
        await sendRequestForSemesterWithdrawalForm(value);
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


(function () {
    // Disable these to indicate filling PNumber
    propDisable(getInputItem(inputIdMap.firstNameInput), true);
    propDisable(getInputItem(inputIdMap.lastNameInput), true);
    // Add Event Listener
    getInputItem(inputIdMap.pNumberInput).on('input', pNumberChangeHandler);
})();