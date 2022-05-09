/* globals chrome */
const getCommonFeedbackHTML = (sendResponse) => {
    chrome.storage.sync.get(['commonFeedbackHTML'], response => {
        sendResponse({success: true, innerHTML: response.commonFeedbackHTML});
    });
}