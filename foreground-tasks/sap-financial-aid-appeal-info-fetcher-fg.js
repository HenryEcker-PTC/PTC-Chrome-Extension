/* globals chrome, $ */
const doInputValue = (pageItemId, value, triggerEvent) => {
    const field = $(`input[data-pageitemid="${pageItemId}"]`);
    field.val(value);
    field[0].dispatchEvent(new Event(triggerEvent));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("fg", request);
    if (request.action === 'write_sap_details' && request.from === 'popup') {
        const data = request.sapInfo;
        // P-Number
        doInputValue(10633546, data.pNumber, 'keyup');
        // Full Name
        doInputValue(10633548, data.name, 'change');
        // SAP GPA
        doInputValue(10633662, data.gpa, 'change');
        // Program Completion Rate
        doInputValue(10633663, data.completionRate, 'change');
        // Timeframe
        doInputValue(10633665, data.timeframe, 'change');
    }
    sendResponse({success: true});
    return true;
});