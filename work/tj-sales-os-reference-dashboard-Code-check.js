const REF_TEST_CONFIG = {
  htmlFileName: 'tj-sales-os-reference-dashboard',
  referenceSheetName: '参照設定'
};

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile(REF_TEST_CONFIG.htmlFileName)
    .setTitle('TJ-SalesOS Reference Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function buildSalesOsReferenceSheet() {
  const ss = getConfigSpreadsheet_();
  let sheet = ss.getSheetByName(REF_TEST_CONFIG.referenceSheetName);
  if (!sheet) sheet = ss.insertSheet(REF_TEST_CONFIG.referenceSheetName);

  const headers = ['営業部名', 'スプレッドシートID', 'シート名', '対象月', '有効フラグ', '備考'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);

  return { ok: true, sheetName: REF_TEST_CONFIG.referenceSheetName, headers };
}

function getSalesOsDeptOptions() {
  return getReferenceConfigRows_()
    .filter(row => isEnabled_(row['有効フラグ']))
    .map(row => String(row['営業部名'] || '').trim())
    .filter(Boolean);
}

function getSalesOsReferenceConfig(deptName) {
  const targetDept = String(deptName || '').trim();
  if (!targetDept) throw new Error('営業部名が指定されていません。');

  const row = getReferenceConfigRows_().find(item =>
    String(item['営業部名'] || '').trim() === targetDept &&
    isEnabled_(item['有効フラグ'])
  );

  if (!row) throw new Error(`参照設定に有効な営業部がありません: ${targetDept}`);

  return {
    deptName: String(row['営業部名'] || '').trim(),
    spreadsheetId: String(row['スプレッドシートID'] || '').trim(),
    sheetName: String(row['シート名'] || '').trim(),
    targetMonth: formatDateLike_(row['対象月']),
    enabled: row['有効フラグ'],
    note: String(row['備考'] || '').trim()
  };
}

function getSalesOsDashboardByDept(deptName) {
  const config = getSalesOsReferenceConfig(deptName);
  if (!config.spreadsheetId) throw new Error(`スプレッドシートIDが空です: ${config.deptName}`);
  if (!config.sheetName) throw new Error(`シート名が空です: ${config.deptName}`);

  const sourceSs = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = sourceSs.getSheetByName(config.sheetName);
  if (!sheet) throw new Error(`参照先シートが見つかりません: ${config.sheetName}`);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error(`参照先シートにデータ行がありません: ${config.sheetName}`);

  const header = values[0].map(value => String(value || '').trim());
  const idx = buildHeaderIndex_(header);
  const rows = values.slice(1).filter(row => row.some(cell => cell !== ''));
  const targetRow = findTargetRow_(rows, idx, config.deptName, config.targetMonth);
  if (!targetRow) {
    throw new Error(`対象データ行が見つかりません: ${config.deptName} / ${config.targetMonth || '対象月未指定'}`);
  }

  const summary = rowToObject_(header, targetRow);
  return {
    selectedDept: config.deptName,
    targetMonth: config.targetMonth || getByHeader_(targetRow, idx, ['対象月', '月']),
    sourceSpreadsheetId: config.spreadsheetId,
    sourceSheetName: config.sheetName,
    sourceSpreadsheetName: sourceSs.getName(),
    rowNumber: values.indexOf(targetRow) + 1,
    headerCount: header.filter(Boolean).length,
    updatedAt: getByHeader_(targetRow, idx, ['更新日時', '最終更新', '最終更新日時']),
    summary
  };
}

function getReferenceConfigRows_() {
  const ss = getConfigSpreadsheet_();
  const sheet = ss.getSheetByName(REF_TEST_CONFIG.referenceSheetName);
  if (!sheet) throw new Error('参照設定シートがありません。先に buildSalesOsReferenceSheet() を実行してください。');
  return sheetToObjects_(sheet);
}

function getConfigSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const id = PropertiesService.getScriptProperties().getProperty('CONFIG_SPREADSHEET_ID');
  if (!id) throw new Error('CONFIG_SPREADSHEET_ID が未設定です。');
  return SpreadsheetApp.openById(id);
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const header = values[0].map(value => String(value || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => rowToObject_(header, row));
}

function rowToObject_(header, row) {
  const obj = {};
  header.forEach((h, i) => {
    if (h) obj[String(h).trim()] = row[i] || '';
  });
  return obj;
}

function getByHeader_(row, idx, candidates) {
  for (const key of candidates) {
    if (idx[key] !== undefined) return String(row[idx[key]] || '').trim();
  }
  return '';
}

function buildHeaderIndex_(header) {
  const idx = {};
  header.forEach((name, i) => {
    if (name && idx[name] === undefined) idx[name] = i;
  });
  return idx;
}

function findTargetRow_(rows, idx, deptName, targetMonth) {
  const deptCandidates = ['営業部名', '営業部', '部門名'];
  const monthCandidates = ['対象月', '月'];
  const targetDept = String(deptName || '').trim();
  const targetMonthText = String(targetMonth || '').trim();

  const byDept = rows.filter(row => getByHeader_(row, idx, deptCandidates) === targetDept);
  const scope = byDept.length ? byDept : rows;

  if (targetMonthText) {
    const byMonth = scope.find(row => formatDateLike_(getByHeader_(row, idx, monthCandidates)) === targetMonthText);
    if (byMonth) return byMonth;
  }
  return scope[0] || null;
}

function isEnabled_(value) {
  if (value === true) return true;
  const text = String(value || '').trim().toUpperCase();
  return ['TRUE', '1', 'YES', 'ON', '有効'].includes(text);
}

function formatDateLike_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy/MM');
  }
  return String(value).trim();
}
