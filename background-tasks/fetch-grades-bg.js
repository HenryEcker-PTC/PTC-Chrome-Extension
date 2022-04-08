const letterGradeConverter = async (p) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['A', 'B', 'C', 'D'], response => {
            if (p < response.D) {
                resolve("F");
            } else if (p < response.C) {
                resolve("D");
            } else if (p < response.B) {
                resolve("C");
            } else if (p < response.A) {
                resolve("B");
            } else {
                resolve("A");
            }
        });
    });
};

const midtermGradeConverter = async (p) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['S', 'M'], response => {
            if (p < response.M) {
                resolve("U");
            } else if (p < response.S) {
                resolve("M");
            } else {
                resolve("S");
            }
        });
    });
};


let getGrades = (d2lid, isFinal, sendResponse) => {
    const convertScore = (isFinal) ? letterGradeConverter : midtermGradeConverter;
    fetch(`https://ptcsc.desire2learn.com/d2l/api/le/1.34/${d2lid}/grades/final/values/?pageSize=200`)
        .then(courseRes => courseRes.json())
        .then(courseRes => {
            const d2lRes = courseRes.Objects;
            if (d2lRes) {
                return Promise.all(
                    d2lRes.map((e) => {
                        if (!isFinal || (isFinal && e.GradeValue.ReleasedDate)) {
                            const c = (e.GradeValue.PointsNumerator / e.GradeValue.PointsDenominator) * 100;
                            if (!isNaN(c)) {
                                return fetch(`https://ptcsc.desire2learn.com/d2l/api/le/1.41/${d2lid}/grades/values/${e.User.Identifier}/`)
                                    .then(res => res.json())
                                    .then(resData => {
                                        return convertScore(c).then((res) => ({payload: resData, convertedScore: res}));
                                    }).then(resData => {
                                        return {
                                            OrgDefinedId: e.User.OrgDefinedId,
                                            "score": resData.convertedScore,
                                            "lastDate": resData.payload
                                                .filter(e => e.GradeObjectType === 1 && e.PointsNumerator > 0)
                                                .map(e => e.LastModified)
                                                .reduce(function (a, b) {
                                                    return a > b ? a : b;
                                                })
                                        };
                                    });
                            } else {
                                return Promise.resolve();
                            }
                        }
                    })
                ).then(gradeArray => {
                    const reduced = gradeArray.reduce((acc, curr) => {
                        if (curr) {
                            acc[curr.OrgDefinedId] = {
                                "score": curr.score,
                                "lastDate": curr.lastDate
                            }
                        }
                        return acc;
                    }, {});
                    sendResponse(reduced);
                });
            } else {
                sendResponse({});
            }
        }).catch(() => sendResponse({}));
};

const getAllResponses = async (initialURL) => {
    let url = new URL(initialURL);
    let result = {Items: [], PagingInfo: {HasMoreItems: true}};
    while (result.PagingInfo.HasMoreItems) {
        const response = await fetch(url.toString()).then(res => res.json());
        result = {Items: [...result.Items, ...response.Items], PagingInfo: response.PagingInfo};
        url.searchParams.set('bookmark', response.PagingInfo.Bookmark);
    }
    return result;
};

const getPinnedCourses = (sendResponse) => {
    getAllResponses('https://ptcsc.desire2learn.com/d2l/api/lp/1.31/enrollments/myenrollments/?isActive=true&canAccess=true&sortBy=EndDate&orgUnitTypeId=3')
        .then(resData => {
            const filtered = resData.Items
                .filter((e) => e.PinDate && e.Access.StartDate)
                .map(e => ({'id': e.OrgUnit.Id, 'name': e.OrgUnit.Name, 'code': e.OrgUnit.Code}));
            sendResponse({
                success: filtered.length > 0,
                pinnedCourses: filtered
            });
        }).catch(() => sendResponse({success: false}));
};