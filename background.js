importScripts("./background-tasks/fetch-grades-bg.js");
importScripts("./background-tasks/fetch-dates-for-register-bg.js");
importScripts('./modules/moment.min.js');

chrome.runtime.onInstalled.addListener(() => {
    // Set Defaults;
    const defaults = {
        A: 94,
        B: 85,
        C: 75,
        D: 70,
        S: 84,
        M: 76,
        isAdjusted: false
    };
    // Test Which defaults already have values
    chrome.storage.sync.get(Array.from(Object.keys(defaults)), (results) => {
        // Set Default For Unset values:
        chrome.storage.sync.set(
            Object.keys(defaults).filter(r => !(r in results))
                .reduce((obj, key) => {
                    obj[key] = defaults[key];
                    return obj;
                }, {})
        );

    })
});


class PagePattern {
    constructor(name, pattern, filesToInject, UIPath) {
        this.name = name;
        this.pattern = new RegExp(pattern);
        this.filesToInject = filesToInject;
        this.UIPath = UIPath;
    }

    test(url) {
        return this.pattern.test(url);
    }

    injectScripts(tabId) {
        if (Array.isArray(this.filesToInject)) {
            injectScripts(tabId, this.filesToInject);
        }
    }
}

// promisifiy executeScript
const injectScript = (tabId, file) => {
    return new Promise((resolve) => {
        if (file.endsWith('.js')) {
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: [file]
            }, resolve);
        } else if (file.endsWith('.css')) {
            chrome.scripting.insertCSS({
                target: {tabId: tabId},
                files: [file]
            }, resolve);
        } else {
            resolve();
        }
    })
};


const injectScripts = (tabId, files) => {
    files.map((file) => injectScript(tabId, file));
};


const patterns = [
    new PagePattern(
        'bannerPattern',
        "^https?://banner.ptc.edu/FacultySelfService/ssb/GradeEntry#/*",
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/fetch-grades-fg.js',
            './popup/PTC Tools/banner-grade-importer-styles.css'],
        "./injected-only.html"
    ),
    new PagePattern(
        'enterFinalGradeD2LPattern',
        "^https?://ptcsc.desire2learn.com/d2l/lms/grades/admin/enter/grade_final_edit.d2l*",
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/adjust-grades-fg.js'],
        "./injected-only.html"
    ),
    new PagePattern(
        'editAttendanceD2LPattern',
        "^https?://ptcsc.desire2learn.com/d2l/lms/attendance/attendance/data_edit.d2l*",
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/attendance_from_participation_fg.js',
            './popup/afp/afp.css'],
        "./injected-only.html"
    ),
    new PagePattern(
        'attendanceRegisterCreateD2LPattern',
        "^https?://ptcsc.desire2learn.com/d2l/lms/attendance/registers/registers_newedit.d2l*",
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/attendance-register-generator-fg.js'],
        "./register-gen/rg-popup.html"
    ),
    new PagePattern(
        'gradeFeedbackD2LPattern',
        "^https?://ptcsc.desire2learn.com/d2l/le/activities/iterator/*",
        null,
        "./Common Grade Feedback Tools/common-feedback-popup.html"
    ),
    new PagePattern(
        'enterZeroForMissingGrades',
        "^https?://ptcsc.desire2learn.com/d2l/lms/grades/admin/enter/grade_item_edit.d2l*",
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/enter-zero-for-missing-fg.js'],
        "./injected-only.html"
    ),
    new PagePattern(
        'bulkDateManageForAssignments',
        "^https?://ptcsc.desire2learn.com/d2l/lms/manageDates/date_manager.d2l*",
        ['./modules/jquery-3.6.0.min.js', './modules/moment.min.js',
            './foreground-tasks/bulk-date-manager-fg.js'],
        "./register-gen/rg-popup.html"
    ),
];


// listener to Inject foreground script;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.status === 'complete') {
        for (let pattern of patterns) {
            if (pattern.test(tabInfo.url)) {
                pattern.injectScripts(tabId);
                break;
            }
        }
    }
    return true;
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'get_popup_location' && request.from === 'popup') {
        for (let pattern of patterns) {
            if (pattern.test(request.tabInfo.url)) {
                sendResponse({location: pattern.UIPath});
                return;
            }
        }
        sendResponse({location: "no%20op.html"})
    } else if (request.action === 'fetch_grades' && request.from === 'foreground') {
        getGrades(request.d2lid, request.isFinal, sendResponse)
    } else if (request.action === 'fetch_patterns' && request.from === 'popup') {
        sendResponse({success: true, patterns: patterns});
    } else if (request.action === 'fetch_days_arg' && request.from === 'popup') {
        fetchDays(request.start, request.date, request.weekdays, undefined, sendResponse);
    } else if (request.action === 'fetch_pinned_courses' && request.from === 'foreground') {
        getPinnedCourses(sendResponse);
    }
    return true;
});

