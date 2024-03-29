importScripts('./background-tasks/fetch-grades-bg.js');
importScripts('./background-tasks/fetch-dates-for-register-bg.js');
importScripts('./modules/moment.min.js');
importScripts('./background-tasks/fetch-from-degreeworks-bg.js');

chrome.runtime.onInstalled.addListener(() => {
    // Set Defaults;
    const defaults = {
        A: 90,
        B: 80,
        C: 70,
        D: 60,
        S: 79,
        M: 69,
        isAdjusted: false,
        bannerPattern: true,
        enterFinalGradeD2LPattern: true,
        editAttendanceD2LPattern: true,
        attendanceRegisterCreateD2LPattern: true,
        enterZeroForMissingGrades: true,
        enterZeroForMissingGradebook: true,
        bulkDateManageForAssignments: true,
        sapAppealFetcher: false,
        changeOfMajorFetcher: false,
        apContractFormFetcher: false,
        changeOfClassScheduleFormFetcher: false,
        registrationOutsideOfMajorFormFetcher: false
    };
    // Test Which defaults already have values
    chrome.storage.sync.get(Array.from(Object.keys(defaults)), (results) => {
        // Set Default For Unset values:
        chrome.storage.sync.set(
            Object.keys(defaults).filter((r) => {
                return !(r in results);
            })
                .reduce((obj, key) => {
                    obj[key] = defaults[key];
                    return obj;
                }, {})
        );

    });
});


class PagePattern {
    constructor(name, pattern, filesToInject, UIPath) {
        this.name = name;
        this.pattern = pattern;
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
    });
};


const injectScripts = (tabId, files) => {
    files.map((file) => {
        return injectScript(tabId, file);
    });
};


const patterns = [
    new PagePattern(
        'bannerPattern',
        /^https?:\/\/banner\.ptc\.edu\/FacultySelfService\/ssb\/GradeEntry#\//,
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/fetch-grades-fg.js',
            './popup/Banner Grade Importer/banner-grade-importer-styles.css'],
        './injected-only.html'
    ),
    new PagePattern(
        'enterFinalGradeD2LPattern',
        /^https?:\/\/ptcsc\.desire2learn\.com\/d2l\/lms\/grades\/admin\/enter\/grade_final_edit.d2l/,
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/adjust-grades-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'editAttendanceD2LPattern',
        /^https?:\/\/ptcsc\.desire2learn\.com\/d2l\/lms\/attendance\/attendance\/data_edit\.d2l/,
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/attendance_from_participation_fg.js',
            './popup/afp/afp.css'],
        './injected-only.html'
    ),
    new PagePattern(
        'attendanceRegisterCreateD2LPattern',
        /^https?:\/\/ptcsc\.desire2learn\.com\/d2l\/lms\/attendance\/registers\/registers_newedit.d2l/,
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/attendance-register-generator-fg.js'],
        './register-gen/rg-popup.html'
    ),
    new PagePattern(
        'enterZeroForMissingGrades',
        /^https?:\/\/ptcsc\.desire2learn\.com\/d2l\/lms\/grades\/admin\/enter\/(grade_item_edit|grade_category_edit)\.d2l/,
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/enter-zero-for-missing-grade-item-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'enterZeroForMissingGradebook',
        /^https?:\/\/ptcsc\.desire2learn\.com\/d2l\/lms\/grades\/admin\/enter\/user_list_view\.d2l/,
        ['./modules/jquery-3.6.0.min.js', './foreground-tasks/enter-zero-for-missing-gradebook-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'bulkDateManageForAssignments',
        /^https?:\/\/ptcsc\.desire2learn\.com\/d2l\/lms\/manageDates\/date_manager\.d2l/,
        ['./modules/jquery-3.6.0.min.js', './modules/moment.min.js',
            './foreground-tasks/bulk-date-manager-fg.js'],
        './register-gen/rg-popup.html'
    ),
    new PagePattern(
        'sapAppealFetcher',
        /^https:\/\/dynamicforms.ngwebsolutions.com\/Submit\/Page\?.*?&section=98792.*?&page=123525/,
        ['./foreground-tasks/dyanmicforms/dynamicforms-helper-fg.js', './foreground-tasks/dyanmicforms/sap-financial-aid-appeal-info-fetcher-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'changeOfMajorFetcher',
        /^https:\/\/dynamicforms.ngwebsolutions.com\/Submit\/Page\?.*?&section=138821.*?&page=158494/,
        ['./foreground-tasks/dyanmicforms/dynamicforms-helper-fg.js', './foreground-tasks/dyanmicforms/change-of-major-form-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'semesterWithdrawalFormFetcher',
        /^https:\/\/dynamicforms.ngwebsolutions.com\/Submit\/Page\?.*?&section=119802.*?&page=141643/,
        ['./foreground-tasks/dyanmicforms/dynamicforms-helper-fg.js', './foreground-tasks/dyanmicforms/semester-withdrawal-form-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'apContractFormFetcher',
        /^https:\/\/dynamicforms.ngwebsolutions.com\/Submit\/Page\?.*?&section=380225.*?&page=325897/,
        ['./foreground-tasks/dyanmicforms/dynamicforms-helper-fg.js', './foreground-tasks/dyanmicforms/ap-contract-form-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'changeOfClassScheduleFormFetcher',
        /^https:\/\/dynamicforms.ngwebsolutions.com\/Submit\/Page\?.*?&section=182312.*?&page=191058/,
        ['./foreground-tasks/dyanmicforms/dynamicforms-helper-fg.js', './foreground-tasks/dyanmicforms/change-of-class-schedule-form-fg.js'],
        './injected-only.html'
    ),
    new PagePattern(
        'registrationOutsideOfMajorFormFetcher',
        /^https:\/\/dynamicforms.ngwebsolutions.com\/Submit\/Page\?.*?&section=182278.*?&page=191031/,
        ['./foreground-tasks/dyanmicforms/dynamicforms-helper-fg.js', './foreground-tasks/dyanmicforms/registration-outside-of-major-form-fg.js'],
        './injected-only.html'
    )
];


const testPattern = async (url) => {
    for (const pattern of patterns) {
        if (pattern.test(url)) {
            return await new Promise((resolve) => {
                chrome.storage.sync.get(pattern.name, (response) => {
                    if (response[pattern.name]) {
                        resolve(pattern);
                    } else {
                        resolve(undefined);
                    }
                });
            });
        }
    }
    return undefined;
};

// listener to Inject foreground script;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.status === 'complete') {
        testPattern(tabInfo.url).then((pattern) => {
            if (pattern) {
                pattern.injectScripts(tabId);
            }
        });
    }
    return true;
});


const handlePopupRequest = (request, sender, sendResponse) => {
    switch (request.action) {
        case 'get_popup_location': {
            testPattern(request.tabInfo.url).then((pattern) => {
                if (pattern) {
                    sendResponse({location: pattern.UIPath});
                } else {
                    sendResponse({location: 'no%20op.html'});
                }
            });
            break;
        }
        case 'fetch_patterns': {
            sendResponse({success: true, patterns: patterns});
            break;
        }
        case 'fetch_days_arg': {
            fetchDays(request.start, request.date, request.weekdays, undefined, sendResponse);
            break;
        }
    }
}

const handleForegroundRequest = (request, sender, sendResponse) => {
    switch (request.action) {
        case 'fetch_grades': {
            getGrades(request.d2lid, request.isFinal, sendResponse);
            break;
        }
        case 'fetch_pinned_courses': {
            getPinnedCourses(sendResponse);
            break;
        }
        case 'request_sap_details': {
            void getStudentSAPFields(request.pNumber, sendResponse);
            break;
        }
        case 'request_change_of_major_details':
        case 'request_semester_withdrawal_details':
        case 'request_semester_ap_contract_details':
        case 'request_change_of_schedule_form_details':
        case 'request_registration_outside_major_details': {
            void getStudentInfo(request.pNumber, sendResponse);
            break;
        }
        case 'request_student_class_details': {
            void getStudentCourseInfo(request.pNumber, sendResponse);
            break;
        }
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.from) {
        case 'popup': {
            handlePopupRequest(request, sender, sendResponse);
            break;
        }
        case 'foreground': {
            handleForegroundRequest(request, sender, sendResponse);
            break;
        }
    }
    return true;
});

