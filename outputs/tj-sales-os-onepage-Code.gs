const ONE_PAGE_CONFIG = {
  htmlFileName: 'tj-sales-os-onepage',
  referenceSheetName: '参照設定',
  defaultDataSheetName: 'OS実績管理用'
};

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile(ONE_PAGE_CONFIG.htmlFileName)
    .setTitle('TJ-SalesOS 営業部サマリー')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSalesOsDeptOptions() {
  const rows = getReferenceConfigRows_();
  return rows
    .filter(row => isEnabled_(row['有効フラグ']))
    .map(row => String(row['営業部名'] || '').trim())
    .filter(Boolean);
}

function getSalesOsReferenceConfig(deptName) {
  const targetDept = String(deptName || '').trim();
  if (!targetDept) throw new Error('営業部名が指定されていません。');

  const rows = getReferenceConfigRows_();
  const row = rows.find(item =>
    String(item['営業部名'] || '').trim() === targetDept &&
    isEnabled_(item['有効フラグ'])
  );

  if (!row) {
    throw new Error(`参照設定に有効な営業部がありません: ${targetDept}`);
  }

  return {
    deptName: String(row['営業部名'] || '').trim(),
    spreadsheetId: String(row['スプレッドシートID'] || '').trim(),
    sheetName: String(row['シート名'] || '').trim(),
    targetMonth: formatDateLike_(row['対象月']),
    note: String(row['備考'] || '').trim()
  };
}

function getSalesOsDashboardByDept(deptName) {
  const config = getSalesOsReferenceConfig(deptName);
  if (!config.spreadsheetId) {
    throw new Error(`参照設定のスプレッドシートIDが空です: ${config.deptName}`);
  }
  if (!config.sheetName) {
    throw new Error(`参照設定のシート名が空です: ${config.deptName}`);
  }

  const sourceSs = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = sourceSs.getSheetByName(config.sheetName);
  if (!sheet) {
    throw new Error(`参照先シートが見つかりません: ${config.sheetName}`);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    throw new Error(`参照先シートにデータ行がありません: ${config.sheetName}`);
  }

  const header = values[0].map(value => String(value || '').trim());
  const idx = buildHeaderIndex_(header);
  const targetRow = findDashboardRow_(values.slice(1), idx, config.deptName, config.targetMonth);

  if (!targetRow) {
    throw new Error(`対象データが見つかりません: ${config.deptName} / ${config.targetMonth || '対象月未指定'}`);
  }

  const summary = rowToObject_(header, targetRow);
  const updatedAt = getByHeader_(targetRow, idx, ['更新日時', '最終更新', '最終更新日時']) || formatDateLike_(new Date());

  return {
    selectedDept: config.deptName,
    targetMonth: config.targetMonth || getByHeader_(targetRow, idx, ['対象月', '月']),
    sourceSpreadsheetId: config.spreadsheetId,
    sourceSheetName: config.sheetName,
    updatedAt,
    summary
  };
}

function buildSalesOsReferenceSheet() {
  const ss = getConfigSpreadsheet_();
  let sheet = ss.getSheetByName(ONE_PAGE_CONFIG.referenceSheetName);
  if (!sheet) sheet = ss.insertSheet(ONE_PAGE_CONFIG.referenceSheetName);

  const headers = ['営業部名', 'スプレッドシートID', 'シート名', '対象月', '有効フラグ', '備考'];
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = headers.some((h, i) => current[i] !== h);
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  if (sheet.getLastRow() < 2) {
    const activeId = ss.getId();
    const sampleRows = [
      ['千葉営業部', activeId, ONE_PAGE_CONFIG.defaultDataSheetName, '2026/06', true, '千葉用'],
      ['神奈川営業部', activeId, ONE_PAGE_CONFIG.defaultDataSheetName, '2026/06', true, '神奈川用'],
      ['埼玉営業部', activeId, ONE_PAGE_CONFIG.defaultDataSheetName, '2026/06', true, '埼玉用']
    ];
    sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);
  }

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  return {
    ok: true,
    sheetName: ONE_PAGE_CONFIG.referenceSheetName,
    headers
  };
}

function getSalesOsOnePageRows() {
  const ss = getConfigSpreadsheet_();
  return {
    osRows: sheetToObjects_(ss, 'OS実績管理用'),
    purchaseRows: sheetToObjects_(ss, 'OS買取詳細用'),
    salesRows: sheetToObjects_(ss, 'OS販売詳細用'),
    dashRows: sheetToObjects_(ss, '営業部DASH_DB')
  };
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

function getReferenceConfigRows_() {
  const ss = getConfigSpreadsheet_();
  let sheet = ss.getSheetByName(ONE_PAGE_CONFIG.referenceSheetName);
  if (!sheet) {
    buildSalesOsReferenceSheet();
    sheet = ss.getSheetByName(ONE_PAGE_CONFIG.referenceSheetName);
  }
  const rows = sheetToObjects_(ss, ONE_PAGE_CONFIG.referenceSheetName, false);
  if (!rows.length) throw new Error('参照設定シートに有効な設定行がありません。');
  return rows;
}

function getConfigSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  const id = PropertiesService.getScriptProperties().getProperty('CONFIG_SPREADSHEET_ID');
  if (!id) {
    throw new Error('参照設定を読むスプレッドシートが見つかりません。バインド型GASで実行するか、CONFIG_SPREADSHEET_ID を設定してください。');
  }
  return SpreadsheetApp.openById(id);
}

function sheetToObjects_(ss, sheetName, requireDept) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(value => String(value || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => rowToObject_(headers, row))
    .filter(row => requireDept === false || row['営業部名']);
}

function buildHeaderIndex_(header) {
  const idx = {};
  header.forEach((name, i) => {
    if (name && idx[name] === undefined) idx[name] = i;
  });
  return idx;
}

function findDashboardRow_(rows, idx, deptName, targetMonth) {
  const deptCandidates = ['営業部名', '営業部', '部門名'];
  const monthCandidates = ['対象月', '月'];
  const targetDept = String(deptName || '').trim();
  const targetMonthText = String(targetMonth || '').trim();

  const activeRows = rows.filter(row => row.some(cell => cell !== ''));
  const matchedByDept = activeRows.filter(row => getByHeader_(row, idx, deptCandidates) === targetDept);
  const scope = matchedByDept.length ? matchedByDept : activeRows;

  if (targetMonthText) {
    const byMonth = scope.find(row => formatDateLike_(getByHeader_(row, idx, monthCandidates)) === targetMonthText);
    if (byMonth) return byMonth;
  }

  return scope[0] || null;
}

function isEnabled_(value) {
  if (value === true) return true;
  const text = String(value || '').trim().toUpperCase();
  return ['TRUE', '1', 'YES', '有効', 'ON'].includes(text);
}

function formatDateLike_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy/MM');
  }
  return String(value).trim();
}

function refreshSalesDash() {
  SpreadsheetApp.flush();
  return { ok: true, updatedAt: new Date() };
}
