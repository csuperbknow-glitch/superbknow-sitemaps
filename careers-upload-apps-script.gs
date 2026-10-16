/**
 * AVP Careers – resume / document upload endpoint
 * ------------------------------------------------
 * Receives files from the application form on careers.html and saves them
 * into the AVP careers Google Drive folder, one subfolder per applicant.
 * Returns each saved file's Drive link, which the page then sends to the
 * "Careers" Google Form along with the rest of the answers.
 *
 * Setup (once):
 *   1. Go to https://script.google.com → New project. Paste this whole file
 *      over the starter code and save.
 *   2. Deploy → New deployment → type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Click Deploy and approve the Google Drive permission prompt.
 *   3. Copy the Web app URL (ends in /exec) into CONFIG.UPLOAD_URL in
 *      careers.html.
 *
 * After editing this script later, use Deploy → Manage deployments → Edit →
 * Version: "New version" so the same URL keeps working.
 */

// The careers Drive folder:
// https://drive.google.com/drive/folders/1Orgo7H6eSfoSFBwMnUqAFObQcDFNn4Xs
var FOLDER_ID = '1Orgo7H6eSfoSFBwMnUqAFObQcDFNn4Xs';

var MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file

var ALLOWED = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);

    var fileName = String(req.fileName || '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 150);
    var ext = fileName.split('.').pop().toLowerCase();
    if (!ALLOWED[ext]) {
      return json_({ ok: false, error: 'Only PDF, DOC or DOCX files are allowed.' });
    }

    var bytes = Utilities.base64Decode(String(req.data || ''));
    if (!bytes.length) {
      return json_({ ok: false, error: 'The file is empty.' });
    }
    if (bytes.length > MAX_BYTES) {
      return json_({ ok: false, error: fileName + ' is larger than 10 MB.' });
    }
    if (!looksLike_(ext, bytes)) {
      return json_({ ok: false, error: fileName + ' is not a valid PDF or Word document.' });
    }

    var folder = applicantFolder_(String(req.applicant || ''), String(req.submissionId || ''));
    var file = folder.createFile(Utilities.newBlob(bytes, ALLOWED[ext], fileName));

    return json_({ ok: true, url: file.getUrl() });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Upload failed. Please try again.' });
  }
}

// Lets you open the /exec URL in a browser to check the deployment is live.
function doGet() {
  return json_({ ok: true, status: 'AVP careers upload endpoint is running.' });
}

// One subfolder per application, e.g. "2026-10-16 – Jane Doe – lq2x9k3abc".
// The page uploads an applicant's files one at a time, so they all land here.
function applicantFolder_(applicant, submissionId) {
  var parent = DriveApp.getFolderById(FOLDER_ID);
  var name = [
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    applicant.replace(/[^\w .,'@-]/g, '').trim().slice(0, 80) || 'Applicant',
    submissionId.replace(/[^\w-]/g, '').slice(0, 20) || Utilities.getUuid().slice(0, 8)
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

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
