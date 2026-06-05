const LITE_CONFIG = {
  spreadsheetId: '1uzzA7hHHPS1WaEACwKK82XL8cuEy4LQmAP_jiz7ycoE',
  htmlFileName: 'tj-sales-os-lite-dashboard',
  sheetName: 'OS買取詳細用'
};

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile(LITE_CONFIG.htmlFileName)
    .setTitle('TJ-SalesOS Lite')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getLiteDashboardRows() {
  const ss = SpreadsheetApp.openById(LITE_CONFIG.spreadsheetId);
  const sheet = ss.getSheetByName(LITE_CONFIG.sheetName);
  if (!sheet) throw new Error(LITE_CONFIG.sheetName + ' が見つかりません。');
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(v => String(v || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        if (header) obj[header] = row[i];
      });
      obj['当月出品比率'] = row[17]; // OS買取詳細用 R列（当月出品比率）
      obj['入庫平均日数'] = row[18]; // OS買取詳細用 S列
      obj['査定CVR'] = row[131]; // OS買取詳細用 EB列（査定率）
      obj['即決契約数'] = row[153]; // OS買取詳細用 EX列
      obj['管理契約数'] = row[154]; // OS買取詳細用 EY列
      return obj;
    })
    .filter(row => row['営業部名']);
}
