const getStudentSchoolAndDegree = (pNumber) => {
    return fetch(`https://degreeworks.ptc.edu/Dashboard/api/students?studentId=${pNumber}`)
        .then(res => res.json())
        .then(resData => {
            if (
                resData?._embedded === undefined ||
                resData._embedded?.students === undefined ||
                resData._embedded.students.length === 0) {
                return undefined;
            }

            const student = resData._embedded.students[0];
            if (student?.name === undefined) {
                return undefined;
            }
            const name = student.name;
            if (
                student?.goals === undefined ||
                student.goals.length === 0
            ) {
                return undefined;
            }
            const goal = student.goals[0];
            if (goal?.school === undefined) {
                return undefined;
            }
            const school = goal.school.key;
            if (goal?.degree === undefined) {
                return undefined;
            }
            const degree = goal.degree.key;
            return {
                pNumber: pNumber,
                name: name,
                school: school,
                degree: degree
            };
        });
}

const studentSAPDetails = (pNumber, school, degree) => {
    const usp = new URLSearchParams();
    usp.set('studentId', pNumber); // string
    usp.set('school', school); // string
    usp.set('degree', degree); // string
    usp.set('is-process-new', true); // boolean
    usp.set('audit-type', 'AA'); // string
    usp.set('auditId', ''); // unknown
    usp.set('include-inprogress', true); // boolean
    usp.set('include-preregistered', true); // boolean
    usp.set('aid-term', ''); // unknown

    return fetch(`https://degreeworks.ptc.edu/Dashboard/api/audit?${usp.toString()}`)
        .then(res => res.json())
        .then(resData => {
            if (resData?.degreeInformation === undefined) {
                return undefined;
            }
            const degreeInformation = resData.degreeInformation;
            if (degreeInformation?.reportArray === undefined || degreeInformation.reportArray.length === 0) {
                return undefined;
            }
            const sapFields = degreeInformation.reportArray.filter(report => {
                return ["SAP_GPA", "TIMEFRAME", "PRGCMPRATE" /*, "CELL_PHONE", "HOME_PHONE", "STU_EMAIL"*/].includes(report.code);
            });
            return sapFields.reduce((acc, report) => ({...acc, [report.code]: report.value}), {});
        });
}

const reorderCommaName = (name) => {
    const [last, first] = name.split(', ');
    return `${first.trim()} ${last.trim()}`;
}

const getStudentSAPFields = (pNumber, sendResponse) => {
    getStudentSchoolAndDegree(pNumber)
        .then(studentDegreeAndSchool => {
            if (studentDegreeAndSchool === undefined) {
                return sendResponse({success: false});
            }
            studentSAPDetails(studentDegreeAndSchool.pNumber, studentDegreeAndSchool.school, studentDegreeAndSchool.degree)
                .then(sapResponse => {
                    if (sapResponse === undefined) {
                        return sendResponse({success: false});
                    }
                    return sendResponse({
                        success: true,
                        pNumber: pNumber,
                        name: reorderCommaName(studentDegreeAndSchool.name),
                        gpa: sapResponse.SAP_GPA,
                        timeframe: sapResponse.TIMEFRAME,
                        completionRate: sapResponse.PRGCMPRATE
                    })
                })
        });
}