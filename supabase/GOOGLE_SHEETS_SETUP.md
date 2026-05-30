# MSSI → Google Sheets 연동 설정 가이드

## 1. Google Sheet 만들기

1. 첨부한 익셀 파일(기분장애클리닉_기본_설문지.xlsx)을 Google Drive에 업로드
2. 업로드한 파일을 마우스 우클릭 → **Google 스프레드시트로 열기**
3. 시트 이름 확인:
   - `검사결과지` (결과 보고서, 채점수식 포함)
   - `결과계산(2)` (원본 데이터 템플릿)
4. **새 시트 추가**: `+` 버튼 → 이름을 `RAW_DATA`로 변경

## 2. Apps Script 배포

1. Google Sheets 메뉴: **확장 프로그램 → Apps Script**
2. `Code.gs` 에디터가 열리면, 아래 코드를 **전체 붙여넣기** (기존 코드 덮어쓰기):

```javascript
/**
 * MSSI Survey → Google Sheets Webhook
 * 배포: 실행 → 나 / 액세스 → 모든 사용자(익명)
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    let rawSheet = ss.getSheetByName('RAW_DATA');
    if (!rawSheet) {
      rawSheet = ss.insertSheet('RAW_DATA');
      const headers = buildHeaders(params);
      rawSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      rawSheet.setFrozenRows(1);
    }
    
    const newRow = buildRow(params, rawSheet);
    rawSheet.appendRow(newRow);
    
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
 * CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * RAW_DATA 시트 헤더 생성
 */
function buildHeaders(params) {
  const fixed = [
    'timestamp', 'patient_id', 'dob',
    'hospital_code', 'patient_number',
    'doctor_nickname', 'hospital_nickname'
  ];
  const qIds = Object.keys(params.answers || {}).sort();
  return [...fixed, ...qIds];
}

/**
 * 데이터 행 생성
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
        row.push(
          params.answers && params.answers[h] !== undefined
            ? params.answers[h]
            : ''
        );
    }
  }
  return row;
}
```

3. 저장 (Ctrl+S) → 프로젝트 이름: `MSSI_Webhook`
4. **배포 → 새 배포**
   - 실행: `나`
   - 액세스: **모든 사용자(익명)**
   - 배포 → URL 복사 (예: `https://script.google.com/macros/s/.../exec`)

## 3. 웹앱 설정 (`config.js`)

1. `/workspace/MSSI/config.js` 열기
2. `GOOGLE_SHEETS_WEBHOOK_URL` 값을 Apps Script 배포 URL로 변경:

```javascript
export const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

3. 커밋 후 푸시 → GitHub Pages 자동 배포

```bash
git add config.js app.js
git commit -m "feat: Google Sheets 웹훅 연동 (RAW_DATA 시트)"
git push
```

## 4. 테스트

1. 환자 계정으로 로그인 → 설문 제출
2. Google Sheets에서 `RAW_DATA` 시트 확인
3. 새로운 행에 데이터가 추가되었는지 확인

## 5. 결과 확인

RAW_DATA 시트에는 모든 원시 응답이 저장됩니다.
채점 결과를 보려면:

- **의사 페이지** (`respondent.html`)에서 결과 조회 가능
- Google Sheets의 `검사결과지` 시트는 기존 채점수식 유지
- RAW_DATA 데이터를 기반으로 새 시트에 QUERY/FILTER 수식 사용 가능

## 6. snumood@gmail.com 으로 이전

1. snumood@gmail.com 계정으로 위 1~3번 반복
2. 새 Apps Script 배포 URL을 `config.js`에 입력
3. 배포 → 완료

---

### 🔒 보안 참고

- Apps Script 배포 시 **"액세스: 모든 사용자(익명)"** 으로 해야 웹앱이 POST 가능
- 하지만 URL을 아는 사람만 요청 가능하고, 시트 자체는 계정 소유자만 접근 가능
- URL은 `config.js`에만 저장되므로 노출되지 않음
