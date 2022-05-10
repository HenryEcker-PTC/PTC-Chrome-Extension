/* globals chrome, ClipboardJS */

const setCopyLinks = () => {
    const clipboard = new ClipboardJS('.easy-copyable-button', {});
    clipboard.on('success', (e) => {
        e.clearSelection();
    });
};

const mountPoint = document.getElementById('mount-point');

chrome.runtime.sendMessage({
        action: 'fetch_common_feedback_html',
        from: 'popup',
    },
    (res) => {
        if (chrome.runtime.lastError) {
            console.error('Error');
            return;
        }
        if (res.success && res.innerHTML.length > 0) {
            mountPoint.innerHTML = res.innerHTML;
            setCopyLinks()
        }
    }
);