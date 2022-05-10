/* globals Quill, chrome, uuidv4, $ */

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
const commonFeedbackSave = document.getElementById('common-feedback-editor-save');

/* Text Editor */
/* Custom Icon */
const icons = Quill.import('ui/icons');
icons['copy'] = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:cc="http://web.resource.org/cc/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:sodipodi="http://inkscape.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:ns1="http://sozi.baierouge.fr"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    id="svg1468"
    sodipodi:docname="paperface1.svg"
    viewBox="0 0 187.5 187.5"
    sodipodi:version="0.32"
    version="1.0"
    y="0"
    x="0"
    inkscape:version="0.42"
    sodipodi:docbase="C:\\Documents and Settings\\Jarno\\Omat tiedostot\\vanhasta\\opencliparts\\omat\\symbols"
  >
  <sodipodi:namedview
      id="base"
      bordercolor="#666666"
      inkscape:pageshadow="2"
      inkscape:window-width="640"
      pagecolor="#ffffff"
      inkscape:zoom="1.8346667"
      borderopacity="1.0"
      inkscape:current-layer="svg1468"
      inkscape:cx="93.750000"
      inkscape:cy="93.750000"
      inkscape:window-height="480"
      inkscape:pageopacity="0.0"
  />
  <g
      id="layer1"
    >
    <g
        id="g2796"
        transform="matrix(.79582 0 0 .79582 541 -147)"
      >
      <path
          id="path2763"
          style="stroke-linejoin:round;stroke:#000000;stroke-linecap:round;stroke-width:3.75;fill:#ffffff"
          d="m-614 234.36h104v136h-62l-42-44v-92z"
      />
      <path
          id="path2765"
          style="stroke:#000000;stroke-width:3.75;fill:none"
          d="m-613.75 325.52l42.22-6.27-0.42 51.41"
      />
      <path
          id="path2773"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-600 252.36h74"
      />
      <path
          id="path2775"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-600 264.36h74"
      />
      <path
          id="path2777"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-600 276.36h74"
      />
      <path
          id="path2779"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-600 288.36h74"
      />
      <path
          id="path2781"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-600 300.36h74"
      />
      <path
          id="path2783"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-600 312.36h74"
      />
      <path
          id="path2785"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-566 324.36h40"
      />
      <path
          id="path2787"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-566 336.36h40"
      />
      <path
          id="path2789"
          style="stroke:#000000;stroke-width:2.775;fill:none"
          d="m-565.97 348.36h39.97"
      />
    </g
    >
  </g
  >
  <metadata
    >
    <rdf:RDF
      >
      <cc:Work
        >
        <dc:format
          >image/svg+xml</dc:format
        >
        <dc:type
            rdf:resource="http://purl.org/dc/dcmitype/StillImage"
        />
        <cc:license
            rdf:resource="http://creativecommons.org/licenses/publicdomain/"
        />
        <dc:publisher
          >
          <cc:Agent
              rdf:about="http://openclipart.org/"
            >
            <dc:title
              >Openclipart</dc:title
            >
          </cc:Agent
          >
        </dc:publisher
        >
        <dc:title
          >Paperface 1</dc:title
        >
        <dc:date
          >2006-12-26T00:00:00</dc:date
        >
        <dc:description
        />
        <dc:source
          >https://openclipart.org/detail/24795/-by--24795</dc:source
        >
        <dc:creator
          >
          <cc:Agent
            >
            <dc:title
              >Anonymous</dc:title
            >
          </cc:Agent
          >
        </dc:creator
        >
      </cc:Work
      >
      <cc:License
          rdf:about="http://creativecommons.org/licenses/publicdomain/"
        >
        <cc:permits
            rdf:resource="http://creativecommons.org/ns#Reproduction"
        />
        <cc:permits
            rdf:resource="http://creativecommons.org/ns#Distribution"
        />
        <cc:permits
            rdf:resource="http://creativecommons.org/ns#DerivativeWorks"
        />
      </cc:License
      >
    </rdf:RDF
    >
  </metadata
  >
</svg
>`;
/* Easy Copy Blot */
(function (Embed) {
    'use strict';

    function EasyCopySpan() {
        Object.getPrototypeOf(Embed).apply(this, arguments);
    }

    EasyCopySpan.prototype = Object.create(Embed && Embed.prototype);
    EasyCopySpan.prototype.constructor = EasyCopySpan;

    for (const prop in Embed) {
        EasyCopySpan[prop] = Embed[prop];
    }

    EasyCopySpan.create = function create(value) {
        return value; // expects a domNode as value
    };

    EasyCopySpan.value = function value(domNode) {
        return domNode;
    };

    EasyCopySpan.blotName = 'easy-copy';
    EasyCopySpan.tagName = 'SPAN';

    Quill.register(EasyCopySpan, true);
})(Quill.import('blots/embed'));
/* Toolbar */
const quill = new Quill('#common-feedback-editor', {
    modules: {
        toolbar: {
            /* Custom Handler */
            handlers: {
                'copy': () => {
                    const range = quill.getSelection();
                    if (range !== undefined && range.length !== 0) {
                        const uuid = `c${uuidv4()}`;
                        const text = quill.getText(range.index, range.length);
                        quill.deleteText(range.index, range.length, 'api');
                        const complexSpan = $(`<span><span id="${uuid}">${text}</span> (<button class="easy-copyable-button" data-clipboard-action="copy" data-clipboard-target="#${uuid}">copy</button>)</span>`).get(0);
                        const selection = quill.getSelection();
                        quill.insertEmbed(selection.index, 'easy-copy', complexSpan);
                    }
                }
            },
            container: [
                [{'header': [1, 2, 3, 4, false]}],
                ['bold', 'italic', 'underline'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link'],
                ['blockquote', 'code-block'],
                [{'color': []}, {'background': []}],
                [{'align': []}],
                ['copy']
            ]
        }
    },
    theme: 'snow'  // or 'bubble'
});

chrome.storage.sync.get([
    'A', 'B', 'C', 'D', 'S', 'M',
    'isAdjusted',
    'bannerPattern', 'enterFinalGradeD2LPattern', 'editAttendanceD2LPattern',
    'attendanceRegisterCreateD2LPattern', 'gradeFeedbackD2LPattern',
    'enterZeroForMissingGrades', 'enterZeroForMissingGradebook',
    'bulkDateManageForAssignments', 'commonFeedbackHTML'
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
    quill.root.innerHTML = response.commonFeedbackHTML || '';
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

commonFeedbackSave.addEventListener('click', (ev) => {
    chrome.storage.sync.set({
        commonFeedbackHTML: quill.root.innerHTML
    });
})