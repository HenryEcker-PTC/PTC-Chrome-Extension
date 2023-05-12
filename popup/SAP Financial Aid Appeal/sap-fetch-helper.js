/* globals chrome */
const sapLookupForm = document.getElementById('sap-lookup-form');
const pNumberInputField = document.getElementById('student-p-number');
let isLoading = false;
sapLookupForm.addEventListener('submit', (ev) => {
    if (isLoading) {
        // Don't allow spam submitting
        return;
    }
    ev.preventDefault();
    const value = pNumberInputField.value.toUpperCase().trim();
    if (value.length === 0) {
        return undefined;
    }
    isLoading = true;
    chrome.runtime.sendMessage({
            action: 'request_sap_details',
            from: 'popup',
            pNumber: value
        },
        (res) => {
            if (chrome.runtime.lastError) {
                console.error('Error');
                isLoading = false;
                return;
            }
            if (res.success === true) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'write_sap_details',
                            from: 'popup',
                            sapInfo: res
                        },
                        (fgRes) => {
                            if (fgRes.success === true) {
                                isLoading = false;
                                window.close();
                            }
                        });
                });
                return;
            }
            isLoading = false;
        }
    );
});