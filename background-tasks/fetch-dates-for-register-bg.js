/* globals chrome, moment */
const fetchDays = (start_, end_, weekdays, index, sendResponse) => {
    let start = moment(start_);
    let end = moment(end_);

    var days = [],
        d = moment(start).startOf("day");
    var isIndexed = (typeof index !== "undefined" && index !== null);

    if (typeof weekdays !== "undefined" && weekdays !== null) {
        if (weekdays.constructor !== Array) {
            weekdays = [weekdays];
        }

        for (var w = 0; w < weekdays.length; w++) {
            weekdays[w] = moment(start).day(weekdays[w]).day();
        }
    } else {
        weekdays = [0, 1, 2, 3, 4, 5, 6];
    }

    for (var i = 0; i < (moment(end).endOf("day").diff(moment(start), "days") + 1); i++) {
        var wd = d.day();

        if (isIndexed && !days[wd]) {
            days[wd] = [];
        }

        if (weekdays.indexOf(wd) !== -1) {
            if (isIndexed) {
                days[wd].push(moment(d));
            } else {
                days.push(moment(d));
            }
        }

        d.add(1, "day");
    }

    if (isIndexed) {
        var nDays = [];

        if (index.constructor !== Array) {
            index = [index];
        }

        for (var a = 0; a < days.length; a++) {
            if (!days[a].length) {
                continue;
            }

            for (var n = 0; n < index.length; n++) {
                var ind = parseInt(index[n]);
                if (isNaN(ind)) {
                    continue;
                }
                var ni = (ind - 1);
                if (ind < 0) {
                    ni = (days[a].length + ind);
                }
                nDays.push(days[a][ni]);
            }
        }

        days = nDays;
    }

    days = days
        .sort(function (a, b) {
            return moment.utc(a).diff(moment.utc(b));
        })
        .filter(function (o, p, a) {
            return (o !== null && !o.isSame(a[p - 1]));
        });

    if (!days.length) {
        sendResponse({success: false, days: []});
    }

    sendResponse({
        success: true, days: days.map(function (m) {
            return m.format("LL");
        })
    });
};