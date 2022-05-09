/* globals chrome */
const buildWindow = () => {
    const builder = new WindowBuilder();
    builder.createDialogBox();
};


class WindowBuilder {
    constructor() {
        this.div_id = "mass_attendence_create_div_dialog";
        this.dp_ids = ["First_Day_Of_Classes", "Last_Day_Of_Classes"];
        this.error_vars = {
            border_error: "3px solid #FF0000",
            border_pass: "1px solid #494c4e"
        };
        this.dow_vars = {
            dow_ids: {
                "DOW_Sun": 0,
                "DOW_Mon": 1,
                "DOW_Tue": 2,
                "DOW_Wed": 3,
                "DOW_Thur": 4,
                "DOW_Fri": 5,
                "DOW_Sat": 6
            },
            dow_table_id: "dow_table_selector",
            selected_dow_color: "rgb(127, 255, 0)",
            unselected_dow_color: "rgb(255, 255, 255)",
            selected_days: []
        };
    }

    weekdaysInBetween = (start, date, weekdays) => {
        return new Promise((resolve) => {
            if (!date) {
                date = new Date();
            }
            chrome.runtime.sendMessage({
                action: 'fetch_days_arg', from: 'popup',
                start: start, date: date, weekdays: weekdays
            }, (res) => {
                resolve(res.days);
            })
        });
    };

    inputError(error_b, jentity) {
        if (error_b) {
            jentity.css("border", this.error_vars.border_error);
        } else {
            jentity.css("border", this.error_vars.border_pass);
        }
        return error_b;
    }

    performUntilFinished = (dates, startDate, endDate) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const listener = chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (tabs[0].id === tabId && changeInfo.status === 'complete') {
                    // Detect Page Reload and continue
                    setTimeout(() => {
                        this.performUntilFinished(dates);
                    }, 250);
                }
            });
            chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'write_meetings_arg', from: 'popup',
                    dates: dates,
                    startDate: startDate,
                    endDate: endDate
                },
                (res) => {
                    if (chrome.runtime.lastError) {
                        // Ignore lastError since reload will terminate channel
                    } else {
                        if (res.needed_to_add === 0) {
                            // No More needed to add so stop listening for more
                            chrome.tabs.onUpdated.removeListener(listener);
                            window.close();
                        }
                    }
                });
        });
    };

    writeMeetings() {
        const jstart = $(`#${this.dp_ids[0]}`);
        const jend = $(`#${this.dp_ids[1]}`);
        const jstart_error = this.inputError(jstart.val() === "", jstart);
        const jend_error = this.inputError(jend.val() === "", jend);
        if (!jstart_error && !jend_error) {
            const start_date = new Date(jstart.val());
            const end_date = new Date(jend.val());
            if (!this.inputError(end_date < start_date, jend)) {
                if (this.dow_vars.selected_days.length > 0) {
                    this.weekdaysInBetween(start_date, end_date, this.dow_vars.selected_days)
                        .then((dates) => {
                            this.performUntilFinished(dates, start_date, end_date);
                        });
                }
            }
        }
    }

    createDialogBox() {
        const div = $(`<div id=${this.div_id} title="Attendance Register Builder"></div>`);
        div.append($(`<h1 align="center" class="title">D2L Attendance Register Generator</h1>`));
        div.append($(`<hr/>`));
        // Date Picker Table
        const dp_table = $(`<table align="center" id="dp-table"></table>`);
        const dp_row = $(`<tr></tr>`);

        this.dp_ids.forEach(function (e) {
            dp_row.append($(`<td><div class="D2L-Date-Selector" align="center"><h2 class="title">${e.split("_").join(" ")}</h2><input style="border: ${this.error_vars.border_pass}" autocomplete="off" type="text" id=${e}></div></td>`));
        }.bind(this));

        dp_table.append(dp_row);
        div.append(dp_table);

        div.append($(`<hr/>`));

        // DOW Table
        const dow_table = $(`<table align="center" style="border: ${this.error_vars.border_pass}" id=${this.dow_vars.dow_table_id}></table>`);
        const dow_row = $(`<tr></tr>`);

        Object.keys(this.dow_vars.dow_ids).forEach(function (e) {
            const dow = $(`<td style="border: ${this.error_vars.border_pass}"><h3 style="padding: 10px;">${e.split("_")[1]}</h3></td>`);
            const that = this;
            dow.on("click", function () {
                if (this.style.backgroundColor !== that.dow_vars.selected_dow_color) {
                    this.style.backgroundColor = that.dow_vars.selected_dow_color;
                    that.dow_vars.selected_days.push(that.dow_vars.dow_ids[e]);
                } else {
                    this.style.backgroundColor = that.dow_vars.unselected_dow_color;
                    that.dow_vars.selected_days = that.dow_vars.selected_days.filter(function (v, i, a) {
                        return v !== that.dow_vars.dow_ids[e];
                    });
                }
            });
            dow_row.append(dow);
        }.bind(this));
        dow_table.append(dow_row);
        div.append(dow_table);

        // Button
        div.append($(`<hr/>`));
        var submitButton = $(`<button>Generate</button>`);
        submitButton.click($.proxy(this.writeMeetings, this));
        div.append(submitButton);

        // Add to HTML
        $("#d2l_attendance_register_generator_mount_point").append(div);

        this.dp_ids.forEach(function (e) {
            var node = $("#" + e);
            node.datepicker({
                changeMonth: true,
                todayHighlight: true,
                autoclose: true
            });
            node.blur();
        }.bind(this));

    }
}

buildWindow();