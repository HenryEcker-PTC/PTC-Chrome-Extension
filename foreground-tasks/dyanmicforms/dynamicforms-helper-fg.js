const getInputItem = (pageItemId) => {
    return document.querySelector(`input[data-pageitemid="${pageItemId}"]`);
};

const getSelectItem = (pageItemId) => {
    return document.querySelector(`select[data-pageitemid="${pageItemId}"]`);
};

const doInputValue = (pageItemId, value, triggerEvent) => {
    return new Promise((resolve) => {
        const field = getInputItem(pageItemId);
        field.value = value;
        field.dispatchEvent(new Event(triggerEvent, {bubbles: true}));
        setTimeout(resolve, 25); // Allow time for validation to update
    });
};

const doCellPhoneInput = (nodeElem, cellPhone) => {
    // Cell Phone (Obsolete approach, wish there was something better)
    nodeElem.focus();
    document.execCommand('insertText', false, cellPhone);
}

const propDisable = (nodeElem, isDisabled) => {
    nodeElem.disabled = isDisabled;
};

const chooseSelectSecondOption = (pageItemId) => {
    return new Promise((resolve) => {
        const select = getSelectItem(pageItemId);
        select.value = select.querySelectorAll('option')[1].value;
        select.dispatchEvent(new Event('change', {bubbles: true}));
        setTimeout(resolve, 25);
    });
};