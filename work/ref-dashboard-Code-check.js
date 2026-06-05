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

  if (isLinkOsMatrixSheet_(values)) {
    const summary = parseLinkOsMatrixSheet_(values, config);
    return {
      selectedDept: config.deptName,
      targetMonth: config.targetMonth || summary['対象月'] || '',
      sourceSpreadsheetId: config.spreadsheetId,
      sourceSheetName: config.sheetName,
      sourceSpreadsheetName: sourceSs.getName(),
      rowNumber: 0,
      headerCount: Object.keys(summary).length,
      updatedAt: summary['更新日時'] || '',
      summary
    };
  }

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

function isLinkOsMatrixSheet_(values) {
  const firstRows = values.slice(0, 12).flat().map(value => String(value || '').trim());
  return firstRows.includes('買取詳細') || firstRows.includes('販売詳細') || firstRows.includes('AA詳細');
}

function parseLinkOsMatrixSheet_(values, config) {
  const summary = {
    '営業部名': config.deptName,
    '対象月': config.targetMonth
  };

  const aliases = {
    '営業部': '営業部名',
    'スタッフ数': 'スタッフ数',
    'F': 'F',
    'MQ': 'MQ',
    'G': 'G',
    '拠点数': '拠点数',
    '店長人数': '責任者',
    'MG人数': 'MG人数',
    'MGA人数': 'MG人数',
    '買取PL人数': '買取営業',
    '買取PLA人数': '買取営業',
    '販売PL人数': '販売営業',
    '販売PLA人数': '販売営業',
    '事務': '事務',

    '査定Q': '査定Ｑ',
    '査定Ｑ': '査定Ｑ',
    '買取Q': '買取Ｑ',
    '買取Ｑ': '買取Ｑ',
    '査定CVR': '査定CVR',
    '成約CVR': '成約CVR',
    'AA': 'AAQ',
    '商品': '商品Q',
    'スクラップ': 'スクラップQ',
    '代車': '代車Q',
    '即決成約': '即決契約数',
    '管理契約': '管理契約数',
    'キャンセルQ': '買取キャンセルQ',
    '入庫平均日数': '入庫平均日数',
    '即日': '即日査定',
    '即日比率': '即日査定比率',
    '過去当日Q': '過去当日査定',
    '過去当日比率': '過去当日査定比率',
    '過去後日': '過去後日査定',
    '過去後日比率': '過去後日査定比率',
    '後日': '後日査定',
    '後日比率': '後日査定比率',

    '出品Q': '当月AA出品Q',
    '落札Q': 'AA落札Q',
    '流札Q': 'AA流札Q',
    '取消Q': 'AA取消Q',
    '未処理Q': 'AA未処理Q',
    '持越Q': 'AA翌月Q',
    '赤字Q': 'AA赤字Q',
    '赤字比率': 'AA赤字比率',
    '落札MQ': '当月AAMQ',
    'AA@': 'AA@',
    '未処理MQ': 'AA未処理MQ',
    '赤字金額': 'AA赤字金額',
    'AA純MQ': 'AA純MQ',

    '在庫Q': '在庫台数',
    '受注Q': '当月受注Ｑ',
    '販売済Q': '販売済Q',
    '掲載Q': '掲載数',
    '未掲載Q': '未掲載数',
    '未入庫Q': '未入庫台数',
    '未受入Q': '未受入Q',
    '配車在庫Q': '配車在庫数',
    'キャパQ': 'キャパQ',
    'キャパ比率': 'キャパ比率',
    '在庫金額': '在庫金額',

    '納車台数': '当月納車Ｑ',
    '未納車台数': '当月未納車Ｑ',
    '翌月納車Q': '翌月納車Ｑ',
    '即納Q': '当月受注納車Q',
    '即納比率': '当月即納比率',
    '前月Q': '前月受注納車Q',
    '前月比率': '納車Q前月比率',
    '翌月Q': '翌月Q',
    '翌月比率': '納車Q翌月比率',
    '回転率': '回転率',

    '納車済MQ': '当月納車MQ',
    '未納車MQ': '当月未納車MQ',
    '翌月納車MQ': '翌月納車MQ',
    '納車KBMQ': 'KB納車MQ',
    '未納車KBMQ': 'KB未納車MQ',
    '納車付帯MQ': '当月付帯MQ',
    '未納車付帯MQ': '当月付帯未MQ',
    '販売総MQ': '販売総MQ'
  };

  const accessoryNames = ['クレジット', '保証', 'メンテナンス', 'クリーニング', 'コーティング', 'エアコン', '楽々納車', 'タイヤ交換'];
  accessoryNames.forEach(name => {
    aliases[`${name}Q`] = `${name}Q`;
    aliases[`${name}比率`] = `${name}比率`;
    aliases[`${name}MQ`] = `${name}MQ`;
  });

  for (let r = 0; r < values.length - 1; r++) {
    for (let c = 0; c < values[r].length; c++) {
      const label = String(values[r][c] || '').trim();
      if (!label || !aliases[label]) continue;
      const key = aliases[label];
      const value = values[r + 1][c];
      if (value === '' || value === null || value === undefined) continue;
      if (summary[key] === undefined || summary[key] === '') {
        summary[key] = value;
      }
    }
  }

  deriveLinkOsValues_(summary);
  return summary;
}

function deriveLinkOsValues_(summary) {
  const purchaseQ = toNumber_(summary['買取Ｑ']);
  if (purchaseQ) {
    setIfMissing_(summary, 'AA比率', toNumber_(summary['AAQ']) / purchaseQ);
    setIfMissing_(summary, '商品比率', toNumber_(summary['商品Q']) / purchaseQ);
    setIfMissing_(summary, 'スクラップ比率', toNumber_(summary['スクラップQ']) / purchaseQ);
    setIfMissing_(summary, '代車比率', toNumber_(summary['代車Q']) / purchaseQ);
    setIfMissing_(summary, 'キャンセル比率', toNumber_(summary['買取キャンセルQ']) / purchaseQ);
  }
  const aaQ = toNumber_(summary['当月AA出品Q']);
  if (aaQ) {
    setIfMissing_(summary, 'AA赤字比率', toNumber_(summary['AA赤字Q']) / aaQ);
  }
  const shipQ = toNumber_(summary['当月納車Ｑ']);
  if (shipQ) {
    ['クレジット', '保証', 'メンテナンス', 'クリーニング', 'コーティング', 'エアコン', '楽々納車', 'タイヤ交換'].forEach(name => {
      setIfMissing_(summary, `${name}比率`, toNumber_(summary[`${name}Q`]) / shipQ);
    });
  }
  setIfMissing_(summary, 'スタッフ数',
    toNumber_(summary['責任者']) + toNumber_(summary['買取営業']) + toNumber_(summary['販売営業']) + toNumber_(summary['事務'])
  );
}

function setIfMissing_(obj, key, value) {
  if ((obj[key] === undefined || obj[key] === '') && value !== undefined && value !== null && !isNaN(value)) {
    obj[key] = value;
  }
}

function toNumber_(value) {
  const n = Number(String(value || '').replace(/[¥￥,%Q台件日\s]/g, ''));
  return isNaN(n) ? 0 : n;
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
