/**
 * AVP Careers – application endpoint
 * ----------------------------------
 * Receives applications from the form on careers.html:
 *   - "upload": saves one resume / document into the careers Google Drive
 *     folder, one subfolder per applicant.
 *   - "submit": adds the applicant's answers as one row in the careers
 *     Google Sheet (tab "Applications"). File uploads are not put in the
 *     sheet; the Application ID column matches the applicant's Drive
 *     subfolder name.
 *
 * Setup (once):
 *   1. Go to https://script.google.com → New project. Paste this whole file
 *      over the starter code and save.
 *   2. In the function dropdown at the top pick "setupSheet" and click Run.
 *      Approve the Google Drive / Sheets permission prompt. This creates the
 *      "Applications" tab with its column headings.
 *   3. Deploy → New deployment → type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Click Deploy and copy the Web app URL (ends in /exec) into
 *      CONFIG.SCRIPT_URL in careers.html.
 *
 * After editing this script later, use Deploy → Manage deployments → Edit →
 * Version: "New version" so the same URL keeps working.
 */

// Careers Drive folder:
// https://drive.google.com/drive/folders/1Orgo7H6eSfoSFBwMnUqAFObQcDFNn4Xs
var FOLDER_ID = '1Orgo7H6eSfoSFBwMnUqAFObQcDFNn4Xs';

// Careers responses spreadsheet:
// https://docs.google.com/spreadsheets/d/1sgoorecciQuB9YfYLJjmSN9QRMScf7jogU_CIE8KSlQ/edit
var SPREADSHEET_ID = '1sgoorecciQuB9YfYLJjmSN9QRMScf7jogU_CIE8KSlQ';
var SHEET_NAME = 'Applications';

var MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file
var MAX_TEXT = 5000;              // characters per answer

var ALLOWED = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

// Sheet columns, in order. "key" is the field name sent by careers.html.
var COLUMNS = [
  { header: 'Timestamp',                         key: null,              width: 160 },
  { header: 'Application ID',                    key: null,              width: 130 },
  { header: 'Full Name',                         key: 'fullName',        width: 180, required: true },
  { header: 'Email Address',                     key: 'email',           width: 220, required: true },
  { header: 'Contact Phone Number',              key: 'phone',           width: 150, required: true },
  { header: 'Most Relevant Work Experience',     key: 'experience',      width: 320, required: true },
  { header: 'Professional Skills',               key: 'skills',          width: 220, required: true },
  { header: 'Highest Level of Education',        key: 'education',       width: 200, required: true },
  { header: 'Relevant Certifications',           key: 'certifications',  width: 240 },
  { header: 'Motivation for Applying',           key: 'motivation',      width: 320, required: true },
  { header: 'Professional Achievement',          key: 'achievement',     width: 320 },
  { header: 'Earliest Start Date',               key: 'startDate',       width: 130, required: true },
  { header: 'Preferred Work Arrangement',        key: 'workArrangement', width: 150, required: true },
  { header: 'Information Accurate (Acknowledged)', key: 'infoAccurate',  width: 150, required: true },
  { header: 'Data Processing Consent',           key: 'dataConsent',     width: 150, required: true }
];

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    if (req.action === 'upload') return json_(upload_(req));
    if (req.action === 'submit') return json_(submit_(req));
    return json_({ ok: false, error: 'Unknown request.' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong. Please try again.' });
  }
}

// Lets you open the /exec URL in a browser to check the deployment is live.
function doGet() {
  return json_({ ok: true, status: 'AVP careers application endpoint is running.' });
}

/* ---------------------------------------------------------------------------
   Spreadsheet
   ------------------------------------------------------------------------ */

// Run once from the editor. Safe to run again: it only adds what's missing.
function setupSheet() {
  var sheet = sheet_();
  Logger.log('Ready: "' + SHEET_NAME + '" tab in ' + sheet.getParent().getUrl());
}

// Returns the Applications tab, creating it and its header row if needed.
function sheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME, 0);

  if (sheet.getLastRow() === 0) {
    var headers = COLUMNS.map(function (c) { return c.header; });
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setBackground('#071d38')
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle')
      .setWrap(true);
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 40);
    COLUMNS.forEach(function (c, i) { sheet.setColumnWidth(i + 1, c.width); });
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, headers.length)
      .setVerticalAlignment('top')
      .setWrap(true)
      .setNumberFormat('@'); // plain text, so phone numbers keep leading zeros
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    sheet.getRange(2, 12, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd');
  }

  return sheet;
}

function submit_(req) {
  var answers = req.answers || {};
  var applicationId = cleanId_(req.applicationId);

  var row = [];
  for (var i = 0; i < COLUMNS.length; i++) {
    var col = COLUMNS[i];
    if (col.header === 'Timestamp') { row.push(new Date()); continue; }
    if (col.header === 'Application ID') { row.push(applicationId); continue; }

    var value = answers[col.key];
    if (Object.prototype.toString.call(value) === '[object Array]') value = value.join(', ');
    value = String(value == null ? '' : value).trim().slice(0, MAX_TEXT);

    if (col.required && !value) {
      return { ok: false, error: 'Please complete "' + col.header + '".' };
    }

    if (col.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    if (col.key === 'startDate') {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!m) return { ok: false, error: 'Please enter a valid start date.' };
      row.push(new Date(+m[1], +m[2] - 1, +m[3]));
      continue;
    }

    row.push(safeCell_(value));
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet_().appendRow(row);
  } finally {
    lock.releaseLock();
  }

  return { ok: true };
}

// Stops answers like "=IMPORTXML(...)" from running as spreadsheet formulas.
function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

/* ---------------------------------------------------------------------------
   Drive uploads
   ------------------------------------------------------------------------ */

function upload_(req) {
  var fileName = String(req.fileName || '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 150);
  var ext = fileName.split('.').pop().toLowerCase();
  if (!ALLOWED[ext]) {
    return { ok: false, error: 'Only PDF, DOC or DOCX files are allowed.' };
  }

  var bytes = Utilities.base64Decode(String(req.data || ''));
  if (!bytes.length) {
    return { ok: false, error: fileName + ' is empty.' };
  }
  if (bytes.length > MAX_BYTES) {
    return { ok: false, error: fileName + ' is larger than 10 MB.' };
  }
  if (!looksLike_(ext, bytes)) {
    return { ok: false, error: fileName + ' is not a valid PDF or Word document.' };
  }

  var folder = applicantFolder_(String(req.applicant || ''), cleanId_(req.applicationId));
  var file = folder.createFile(Utilities.newBlob(bytes, ALLOWED[ext], fileName));

  return { ok: true, url: file.getUrl() };
}

// One subfolder per application, e.g. "2026-10-16 – Jane Doe – lq2x9k3abc".
// The page uploads an applicant's files one at a time, so they all land here.
function applicantFolder_(applicant, applicationId) {
  var parent = DriveApp.getFolderById(FOLDER_ID);
  var name = [
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    applicant.replace(/[^\w .,'@-]/g, '').trim().slice(0, 80) || 'Applicant',
    applicationId
  ].join(' – ');

  var existing = parent.getFoldersByName(name);
  return existing.hasNext() ? existing.next() : parent.createFolder(name);
}

// Checks the file's first bytes so renamed non-documents are rejected.
function looksLike_(ext, bytes) {
  function startsWith(sig) {
    for (var i = 0; i < sig.length; i++) {
      if ((bytes[i] & 0xff) !== sig[i]) return false;
    }
    return true;
  }
  if (ext === 'pdf') return startsWith([0x25, 0x50, 0x44, 0x46]);                         // %PDF
  if (ext === 'docx') return startsWith([0x50, 0x4b, 0x03, 0x04]);                        // ZIP
  if (ext === 'doc') return startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // OLE2
  return false;
}

/* ---------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------ */

function cleanId_(id) {
  return String(id || '').replace(/[^\w-]/g, '').slice(0, 20) || Utilities.getUuid().slice(0, 8);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
