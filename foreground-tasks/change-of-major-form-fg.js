const inputIdMap = {
    pNumberInput: 16487209,
    firstNameInput: 16487205,
    lastNameInput: 16487207,
    cellPhoneNumber: 16487223,
    currentMajorCode: 13827255
};

const getInputItem = (pageItemId) => {
    return document.querySelector(`input[data-pageitemid="${pageItemId}"]`);
};

const doInputValue = (pageItemId, value, triggerEvent) => {
    return new Promise((resolve) => {
        const field = getInputItem(pageItemId);
        field.value = value;
        field.dispatchEvent(new Event(triggerEvent, {bubbles: true}));
        setTimeout(resolve, 25); // Allow time for validation to update
    });
};

const sendRequestForChangeOfMajorDetails = (value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
                action: 'request_change_of_major_details',
                from: 'foreground',
                pNumber: value
            },
            async (res) => {
                console.log(res);
                if (chrome.runtime.lastError) {
                    console.error('Error');
                }
                if (res.success === true) {
                    console.log(res.data);
                    const {
                        firstName,
                        lastName,
                        cellPhone,
                        currentMajorCode
                    } = res.data;
                    // First Name
                    void await doInputValue(inputIdMap.firstNameInput, firstName, 'change');
                    // Last Name
                    void await doInputValue(inputIdMap.lastNameInput, lastName, 'change');
                    // Current Major Code
                    void await doInputValue(inputIdMap.currentMajorCode, currentMajorCode, 'change');
                    // Cell Phone (Obsolete approach, wish there was something better)
                    getInputItem(inputIdMap.cellPhoneNumber).focus();
                    document.execCommand('insertText', false, cellPhone);
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
        await sendRequestForChangeOfMajorDetails(value);
    } catch (e) {
        if (Object.hasOwn(e, 'message')) {
            if (window.confirm(e.message)) {
                window.location.reload();
            }
        }
    } finally {
        getInputItem(inputIdMap.firstNameInput).disabled = false;
        getInputItem(inputIdMap.lastNameInput).disabled = false;
    }
};


(function () {
    // Disable these to indicate filling PNumber
    getInputItem(inputIdMap.firstNameInput).disabled = true;
    getInputItem(inputIdMap.lastNameInput).disabled = true;
    // Add Event Listener
    getInputItem(inputIdMap.pNumberInput).addEventListener('input', pNumberChangeHandler);
})();