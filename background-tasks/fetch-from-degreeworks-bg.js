const getStudentSchoolAndDegree = async (pNumber) => {
    const resData = await fetch(`https://degreeworks.ptc.edu/Dashboard/api/students?studentId=${pNumber}`)
        .then((res) => {
            return res.json();
        });

    if (
        resData?._embedded === undefined ||
        resData._embedded?.students === undefined ||
        resData._embedded.students.length === 0) {
        throw new Error("Initial response undefined");
    }
    // Get Student
    const student = resData._embedded.students[0];
    // Get Student Name
    if (student?.name === undefined) {
        throw new Error("Initial response undefined");
    }
    const name = student.name;
    // Get Student Goals Object
    if (
        student?.goals === undefined ||
        student.goals.length === 0
    ) {
        throw new Error("Initial response undefined");
    }
    const goal = student.goals[0];
    // Get School Code
    if (goal?.school === undefined) {
        throw new Error("Initial response undefined");
    }
    const school = goal.school.key;
    // Get Degree Code
    if (goal?.degree === undefined) {
        throw new Error("Initial response undefined");
    }
    const degree = goal.degree.key;
    // Get Major Code
    if (goal?.details === undefined) {
        throw new Error("Initial response undefined");
    }
    const goalMajor = goal.details.filter(v => {
        return v.code.key.toLowerCase().localeCompare('major') === 0
    });
    if (goalMajor.length === 0) {
        throw new Error("Initial response undefined");
    }
    const majorCode = goalMajor[0].value.key;
    return {
        pNumber: pNumber,
        name: name,
        school: school,
        degree: degree,
        majorCode: majorCode
    };
};

const fetchStudentAuditInformation = async (pNumber, school, degree, requestedFields) => {
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

    const resData = await fetch(`https://degreeworks.ptc.edu/Dashboard/api/audit?${usp.toString()}`)
        .then((res) => {
            return res.json();
        })

    if (resData?.degreeInformation === undefined) {
        throw new Error("Audit response undefined");
    }
    const degreeInformation = resData.degreeInformation;
    if (degreeInformation?.reportArray === undefined || degreeInformation.reportArray.length === 0) {
        throw new Error("Audit response undefined");
    }
    const sapFields = degreeInformation.reportArray.filter((report) => {
        return requestedFields.includes(report.code);
    });
    return sapFields.reduce((acc, report) => {
        return {...acc, [report.code]: report.value};
    }, {});
};

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