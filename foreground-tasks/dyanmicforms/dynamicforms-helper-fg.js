const getInputItem = (pageItemId) => {
    return $(`input[data-pageitemid="${pageItemId}"]`);
};

const getSelectItem = (pageItemId) => {
    return $(`select[data-pageitemid="${pageItemId}"]`);
};

const dispatchEventFromJQueryToNode = (jQueryElem, triggerEvent) => {
    jQueryElem[0].dispatchEvent(new Event(triggerEvent));
};

const doInputValue = (pageItemId, value, triggerEvent) => {
    return new Promise((resolve) => {
        const field = getInputItem(pageItemId);
        field.val(value);
        dispatchEventFromJQueryToNode(field, triggerEvent);
        setTimeout(resolve, 25); // Allow time for validation to update
    });
};

const doCellPhoneInput = (jElem, cellPhone) => {
    // Cell Phone (Obsolete approach, wish there was something better)
    jElem.focus();
    document.execCommand('insertText', false, cellPhone);
}

const propDisable = (jElem, isDisabled) => {
    jElem.prop('disabled', isDisabled);
};