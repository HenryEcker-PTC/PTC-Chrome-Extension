const copyToClipboard = (elementId, stripIds = false) => {
    let str = document.getElementById(elementId).innerHTML;
    if (stripIds) {
        str = str.replace(/\s*(id)=\".*\"\s*/g, '')
    }
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

document.getElementById("no_sub_btn")
    .addEventListener("click", (ev) => {
        copyToClipboard('NoSubmissionTemplate')
    });

document.getElementById("no_sub_btn2")
    .addEventListener("click", (ev) => {
        copyToClipboard('NoSubmissionTemplate2')
    });


document.getElementById("pop_clip_std_wrong_fn_btn")
    .addEventListener("click", (ev) => {
        copyToClipboard('WrongFileNameTemplate')
    });