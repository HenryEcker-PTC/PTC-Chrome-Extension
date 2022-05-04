const a = document.getElementById("A");
const b = document.getElementById("B");
const c = document.getElementById("C");
const d = document.getElementById("D");
const s = document.getElementById("S");
const m = document.getElementById("M");
const isAdjusted = document.getElementById("adjusted");
const bannerPattern = document.getElementById("bannerPattern");
const enterFinalGradeD2LPattern = document.getElementById("enterFinalGradeD2LPattern");
const editAttendanceD2LPattern = document.getElementById("editAttendanceD2LPattern");
const attendanceRegisterCreateD2LPattern = document.getElementById("attendanceRegisterCreateD2LPattern");
const gradeFeedbackD2LPattern = document.getElementById("gradeFeedbackD2LPattern");
const enterZeroForMissingGrades = document.getElementById("enterZeroForMissingGrades");
const enterZeroForMissingGradebook = document.getElementById("enterZeroForMissingGradebook");
const bulkDateManageForAssignments = document.getElementById("bulkDateManageForAssignments");

chrome.storage.sync.get([
    'A', 'B', 'C', 'D', 'S', 'M',
    'isAdjusted',
    'bannerPattern', 'enterFinalGradeD2LPattern', 'editAttendanceD2LPattern',
    'attendanceRegisterCreateD2LPattern', 'gradeFeedbackD2LPattern',
    'enterZeroForMissingGrades', 'enterZeroForMissingGradebook',
    'bulkDateManageForAssignments'
], response => {
    a.value = response.A;
    b.value = response.B;
    c.value = response.C;
    d.value = response.D;
    s.value = response.S;
    m.value = response.M;
    isAdjusted.checked = response.isAdjusted;
    bannerPattern.checked = response.bannerPattern;
    enterFinalGradeD2LPattern.checked = response.enterFinalGradeD2LPattern;
    editAttendanceD2LPattern.checked = response.editAttendanceD2LPattern;
    attendanceRegisterCreateD2LPattern.checked = response.attendanceRegisterCreateD2LPattern;
    gradeFeedbackD2LPattern.checked = response.gradeFeedbackD2LPattern;
    enterZeroForMissingGrades.checked = response.enterZeroForMissingGrades;
    enterZeroForMissingGradebook.checked = response.enterZeroForMissingGradebook;
    bulkDateManageForAssignments.checked = response.bulkDateManageForAssignments;
});

const validateForm = () => {
    if (!(d.value < c.value &&
        c.value < b.value &&
        b.value < a.value
    )) {
        alert("Final Grade Tiers must decrease monotonically");
        return false;
    }
    if (!(m.value < s.value)) {
        alert("Midterm Grade Tiers must decrease monotonically");
        return false;
    }

    return true;
};


document.getElementById("updateGradeInfoBtn").addEventListener("click", () => {
    if (validateForm()) {
        chrome.storage.sync.set({
            A: a.value,
            B: b.value,
            C: c.value,
            D: d.value,
            S: s.value,
            M: m.value,
            isAdjusted: isAdjusted.checked
        })
    }
    return true;
});

document.getElementById("updateEnabledTools").addEventListener("click", () => {
    if (validateForm()) {
        chrome.storage.sync.set({
            bannerPattern: bannerPattern.checked,
            enterFinalGradeD2LPattern: enterFinalGradeD2LPattern.checked,
            editAttendanceD2LPattern: editAttendanceD2LPattern.checked,
            attendanceRegisterCreateD2LPattern: attendanceRegisterCreateD2LPattern.checked,
            gradeFeedbackD2LPattern: gradeFeedbackD2LPattern.checked,
            enterZeroForMissingGrades: enterZeroForMissingGrades.checked,
            enterZeroForMissingGradebook: enterZeroForMissingGradebook.checked,
            bulkDateManageForAssignments: bulkDateManageForAssignments.checked,
        })
    }
    return true;
});