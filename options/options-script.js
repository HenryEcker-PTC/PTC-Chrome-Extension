const a = document.getElementById("A");
const b = document.getElementById("B");
const c = document.getElementById("C");
const d = document.getElementById("D");
const s = document.getElementById("S");
const m = document.getElementById("M");
const isAdjusted = document.getElementById("adjusted");

chrome.storage.sync.get(['A', 'B', 'C', 'D', 'S', 'M', 'isAdjusted'], response => {
    a.value = response.A;
    b.value = response.B;
    c.value = response.C;
    d.value = response.D;
    s.value = response.S;
    m.value = response.M;
    isAdjusted.checked = response.isAdjusted;
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


document.getElementById("updateBtn").addEventListener("click", () => {
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