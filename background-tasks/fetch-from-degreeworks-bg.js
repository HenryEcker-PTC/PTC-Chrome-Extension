const destructureSchoolAndDegreeResponse = (resData) => {
    try {
        const {
            _embedded: {
                students: [
                    {
                        name,
                        goals: [
                            {
                                school: {key: school},
                                degree: {key: degree},
                                details
                            }
                        ]
                    }
                ]
            }
        } = resData;
        return {name, school, degree, details};
    } catch (_) {
        throw new Error("Initial response undefined");
    }
}

const processDestructuredSchoolAndDegreeResponse = ({name, school, degree, details}) => {
    if (
        name === undefined ||
        school === undefined ||
        degree === undefined ||
        details === undefined ||
        details.length === 0
    ) {
        throw new Error("Initial response undefined");
    }

    const goalMajor = details.filter(v => {
        return v.code.key.toLowerCase().localeCompare('major') === 0
    });
    if (goalMajor.length === 0) {
        throw new Error("Initial response undefined");
    }
    const majorCode = goalMajor[0].value.key;

    return {name, school, degree, majorCode};
}

const getStudentSchoolAndDegree = async (pNumber) => {
    const url = new URL('https://degreeworks.ptc.edu/Dashboard/api/students');
    url.searchParams.set('studentId', pNumber);

    const res = await fetch(url);
    const resData = await res.json();

    const {name, school, degree, majorCode} = processDestructuredSchoolAndDegreeResponse(
        destructureSchoolAndDegreeResponse(resData)
    );

    return {
        pNumber: pNumber,
        name: name,
        school: school,
        degree: degree,
        majorCode: majorCode
    };

};

const doAuditFetch = async (pNumber, school, degree) => {
    const url = new URL('https://degreeworks.ptc.edu/Dashboard/api/audit');
    url.searchParams.set('studentId', pNumber); // string
    url.searchParams.set('school', school); // string
    url.searchParams.set('degree', degree); // string
    url.searchParams.set('is-process-new', true); // boolean
    url.searchParams.set('audit-type', 'AA'); // string
    url.searchParams.set('auditId', ''); // unknown
    url.searchParams.set('include-inprogress', true); // boolean
    url.searchParams.set('include-preregistered', true); // boolean
    url.searchParams.set('aid-term', ''); // unknown

    const res = await fetch(url);
    return await res.json();
}


const destructureAuditToGetReportArray = (resData) => {
    try {
        const {
            degreeInformation: {
                reportArray
            }
        } = resData;

        return {reportArray};
    } catch (_) {
        throw new Error("Audit response undefined");
    }
}

const processDestructuredAuditReportArray = ({reportArray}) => {
    if (reportArray === undefined || reportArray.length === 0) {
        throw new Error("Audit response undefined");
    }
    return {reportArray};
}

const destructureAuditToGetClassArray = (resData) => {
    try {
        const {
            classInformation: {
                classArray
            }
        } = resData;

        return {classArray};
    } catch (_) {
        throw new Error("Audit response undefined");
    }
}

const processDestructuredAuditClassArray = ({classArray}) => {
    if (classArray === undefined || classArray.length === 0) {
        throw new Error("Audit response undefined");
    }
    return {classArray};
}

const fetchStudentAuditInformation = async (pNumber, school, degree, requestedFields) => {
    const resData = await doAuditFetch(pNumber, school, degree);

    const {reportArray} = processDestructuredAuditReportArray(
        destructureAuditToGetReportArray(resData)
    );
    const sapFields = reportArray.filter((report) => {
        return requestedFields.includes(report.code);
    });
    return sapFields.reduce((acc, report) => {
        return {...acc, [report.code]: report.value};
    }, {});
};


const fetchStudentClassInformation = async (pNumber, school, degree) => {
    const resData = await doAuditFetch(pNumber, school, degree);

    const {classArray} = processDestructuredAuditClassArray(
        destructureAuditToGetClassArray(resData)
    );

    return classArray.reduce((acc, classEntry) => {
        const {
            discipline,
            number,
            section,
            term,
            courseTitle,
            attributeArray
        } = classEntry;

        const [{value: crn}] = attributeArray.filter(({code}) => {
            return code.localeCompare('DWSISKEY') === 0
        });

        return {
            ...acc,
            [crn]: {subject: discipline, number, section, term, courseTitle}
        }
    }, {});
}

const studentSAPDetails = (pNumber, school, degree) => {
    return fetchStudentAuditInformation(pNumber, school, degree, ['SAP_GPA', 'TIMEFRAME', 'PRGCMPRATE']);
};

const studentChangeOfMajorDetails = (pNumber, school, degree) => {
    return fetchStudentAuditInformation(pNumber, school, degree, ["CELL_PHONE", "HOME_PHONE"]);
};

const parseStudentNameParts = (rawName) => {
    const [last, firstMiddle] = rawName.split(/,\s*/);
    const [first, middle] = firstMiddle.split(/\s+(.*)/, 2);
    return {
        firstMiddleName: firstMiddle.trim(),
        firstName: first.trim(),
        middleName: (middle ?? '').trim(),
        lastName: last.trim()
    };
}

const getReorderedFullName = (rawName) => {
    const {firstMiddleName, lastName} = parseStudentNameParts(rawName);
    return `${firstMiddleName} ${lastName}`;
}

// Exported function
// eslint-disable-next-line no-unused-vars
const getStudentSAPFields = async (pNumberRequest, sendResponse) => {
    try {
        const {pNumber, name, school, degree} = await getStudentSchoolAndDegree(pNumberRequest);
        const {SAP_GPA, TIMEFRAME, PRGCMPRATE} = await studentSAPDetails(pNumber, school, degree);

        return sendResponse({
            success: true,
            pNumber: pNumber,
            name: getReorderedFullName(name),
            gpa: SAP_GPA,
            timeframe: TIMEFRAME,
            completionRate: PRGCMPRATE
        });
    } catch (e) {
        console.error(e);
        sendResponse({
            success: false,
            message: 'Try opening DegreeWorks in another tab, log in (if needed), and then return here to click OK (page will refresh).'
        });
    }
};

const getStudentBasicContactInfo = async (pNumberRequest, sendResponse) => {
    try {
        const {pNumber, name, school, degree, majorCode} = await getStudentSchoolAndDegree(pNumberRequest);
        const {CELL_PHONE, HOME_PHONE} = await studentChangeOfMajorDetails(pNumber, school, degree);
        const {firstName, lastName} = parseStudentNameParts(name);
        sendResponse({
            success: true,
            data: {
                pNumber: pNumber,
                firstName: firstName,
                lastName: lastName,
                cellPhone: (CELL_PHONE || HOME_PHONE).replaceAll(/\D/g, ''),
                currentMajorCode: majorCode
            }
        });
    } catch (e) {
        console.error(e);
        sendResponse({
            success: false,
            message: 'Try opening DegreeWorks in another tab, log in (if needed), and then return here to click OK (page will refresh).'
        });
    }
};

const getStudentCourseInfo = async (pNumberRequest, sendResponse) => {
    try {
        const {pNumber, school, degree} = await getStudentSchoolAndDegree(pNumberRequest);
        const classInfo = await fetchStudentClassInformation(pNumber, school, degree);
        sendResponse({
            success: true,
            data: classInfo
        });
    } catch (e) {
        console.error(e);
        sendResponse({
            success: false,
            message: 'Try opening DegreeWorks in another tab, log in (if needed), and then return here to click OK (page will refresh).'
        });
    }
}