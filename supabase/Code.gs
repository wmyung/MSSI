/**
 * Google Sheets Apps Script — MSSI Survey Webhook
 * 
 * 배포 방법:
 * 1. Google Sheets에서 확장 프로그램 → Apps Script
 * 2. 이 코드를 붙여넣기
 * 3. 배포 → 웹 앱으로 배포 (실행: 나, 액세스: 나만)
 * 4. 배포 URL을 복사
 * 
 * @param {Object} e POST 요청 객체
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // RAW_DATA 시트가 없으면 생성
    let rawSheet = ss.getSheetByName('RAW_DATA');
    if (!rawSheet) {
      rawSheet = ss.insertSheet('RAW_DATA');
      // 헤더 행: 모든 질문 ID
      const headers = buildHeaders(params);
      rawSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      rawSheet.setFrozenRows(1);
    }
    
    // 새 데이터 행 추가
    const newRow = buildRow(params, rawSheet);
    rawSheet.appendRow(newRow);
    
    // 결과 반환
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: rawSheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HEADERS: RAW_DATA 시트의 컬럼명
 * 순서: timestamp, patient_id, dob, hospital_code, patient_number → 모든 질문 ID
 */
function buildHeaders(params) {
  const fixed = ['timestamp', 'patient_id', 'dob', 'hospital_code', 'patient_number', 'doctor_nickname', 'hospital_nickname'];
  const qIds = Object.keys(params.answers || {}).sort();
  return [...fixed, ...qIds];
}

/**
 * ROW: 실제 데이터 행
 */
function buildRow(params, sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = [];
  
  for (let h of headers) {
    switch (h) {
      case 'timestamp':
        row.push(params.timestamp || new Date().toISOString());
        break;
      case 'patient_id':
        row.push(params.patientId || '');
        break;
      case 'dob':
        row.push(params.dob || '');
        break;
      case 'hospital_code':
        row.push(params.hospitalCode || '');
        break;
      case 'patient_number':
        row.push(params.patientNumber || '');
        break;
      case 'doctor_nickname':
        row.push(params.doctorNickname || '');
        break;
      case 'hospital_nickname':
        row.push(params.hospitalNickname || '');
        break;
      default:
        // 질문 ID에 해당하는 응답값
        row.push(params.answers && params.answers[h] !== undefined ? params.answers[h] : '');
    }
  }
  
  return row;
}

/**
 * CORS Preflight (OPTIONS) - 브라우저 fetch용
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
