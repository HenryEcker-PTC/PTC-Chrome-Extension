// Exported function
// eslint-disable-next-line no-unused-vars
const getCommonFeedbackHTML = (sendResponse) => {
    chrome.storage.sync.get(['commonFeedbackHTML'], (response) => {
        sendResponse({success: true, innerHTML: response.commonFeedbackHTML});
    });
};