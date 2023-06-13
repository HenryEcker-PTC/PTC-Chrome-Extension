const inputIdMap = {
    pNumberInput: 10633546,
    nameInput: 10633548,
    gpaInput: 10633662,
    completionRateInput: 10633663,
    timeframeInput: 10633665
};

const selectIdMap = {
    semesterSelect: 10633657
};

const chooseSelectSecondOption = (pageItemId) => {
    return new Promise((resolve) => {
        const select = getSelectItem(pageItemId);
        select.value = select.querySelectorAll('option')[1].value;
        select.dispatchEvent(new Event('change', {bubbles: true}));
        setTimeout(resolve, 25);
    });
};

const setDisabledPropForAllFields = (isDisabled) => {
    Object.values(inputIdMap).forEach((inputId) => {
        propDisable(getInputItem(inputId), isDisabled);
    });
    Object.values(selectIdMap).forEach((selectId) => {
        propDisable(getSelectItem(selectId), isDisabled);
    });
};

const sendRequestForSapDetails = (value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
                action: 'request_sap_details',
                from: 'foreground',
                pNumber: value
            },
            async (res) => {
                if (chrome.runtime.lastError) {
                    console.error('Error');
                }
                if (res.success === true) {
                    // Full Name
                    void await doInputValue(inputIdMap.nameInput, res.name, 'change');
                    // Active Semester
                    void await chooseSelectSecondOption(selectIdMap.semesterSelect);
                    // SAP GPA
                    void await doInputValue(inputIdMap.gpaInput, res.gpa, 'change');
                    // Program Completion Rate
                    void await doInputValue(inputIdMap.completionRateInput, res.completionRate, 'change');
                    // Timeframe
                    void await doInputValue(inputIdMap.timeframeInput, res.timeframe, 'change');
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
        setDisabledPropForAllFields(true);
        const value = ev.target.value.toUpperCase().trim();
        if (value.length === 0) {
            return undefined;
        }
        await sendRequestForSapDetails(value);
    } catch (e) {
        if (Object.hasOwn(e, 'message')) {
            if (window.confirm(e.message)) {
                window.location.reload();
            }
        }
    } finally {
        setDisabledPropForAllFields(false);
    }
};

getInputItem(inputIdMap.pNumberInput).addEventListener('change', pNumberChangeHandler);