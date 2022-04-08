chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.runtime.sendMessage({
        action: 'get_popup_location', from: 'popup',
        tabInfo: tabs[0]
    }, (res) => {
        window.location.href = res.location;
    });
});