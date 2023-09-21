const inputIdMap = {
    pNumberInput: 27609457,
    firstNameInput: 27609445,
    lastNameInput: 27609443
};


const sendRequestForAPContractForm = (value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
                action: 'request_semester_ap_contract_details',
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
                        lastName
                    } = res.data;
                    // First Name
                    void await doInputValue(inputIdMap.firstNameInput, firstName, 'change');
                    // Last Name
                    void await doInputValue(inputIdMap.lastNameInput, lastName, 'change');
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
        await sendRequestForAPContractForm(value);
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
    getInputItem(inputIdMap.pNumberInput).addEventListener('input', pNumberChangeHandler);
})();