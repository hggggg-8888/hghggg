const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Movies';

function doPost(e) {
  try {
    const requestBody = e.postData?.contents;
    if (!requestBody) {
      throw new Error('POST 資料不存在');
    }

    const data = JSON.parse(requestBody);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('找不到工作表：' + SHEET_NAME);
    }

    const row = [
      new Date(),
      data.title || '',
      data.director || '',
      data.year || '',
      data.plot || '',
      data.rating || '',
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '影劇資料已成功儲存。' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createMovieSheetTemplate() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  sheet.clear();
  sheet.appendRow(['儲存時間', '片名', '導演', '上映年份', '劇情大綱', '評分']);
}
