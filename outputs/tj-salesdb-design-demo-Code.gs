const REF_TEST_CONFIG = {
  htmlFileName: 'tj-salesdb-design-demo',
  referenceSheetName: '参照設定'
};

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile(REF_TEST_CONFIG.htmlFileName)
    .setTitle('TJ-SalesDB Design Demo')
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
    applyFixedLinkOsCells_(summary, values);
    const personalRows = parseFixedTableRange_(values, 'A31:L63');
    const calendarRows = parseFixedTableRange_(values, 'N31:X62');
    const marketingRows = parseMarketingAreaRows_(values);
    return {
      selectedDept: config.deptName,
      targetMonth: config.targetMonth || summary['対象月'] || '',
      sourceSpreadsheetId: config.spreadsheetId,
      sourceSheetName: config.sheetName,
      sourceSpreadsheetName: sourceSs.getName(),
      rowNumber: 0,
      headerCount: Object.keys(summary).length,
      updatedAt: summary['更新日時'] || '',
      summary,
      personalRows,
      calendarRows,
      marketingRows,
      fieldMeta: buildFieldMeta_(values)
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
  applyFixedLinkOsCells_(summary, values);
  const personalRows = parseFixedTableRange_(values, 'A31:L63');
  const calendarRows = parseFixedTableRange_(values, 'N31:X62');
  const marketingRows = parseMarketingAreaRows_(values);
  return {
    selectedDept: config.deptName,
    targetMonth: config.targetMonth || getByHeader_(targetRow, idx, ['対象月', '月']),
    sourceSpreadsheetId: config.spreadsheetId,
    sourceSheetName: config.sheetName,
    sourceSpreadsheetName: sourceSs.getName(),
    rowNumber: values.indexOf(targetRow) + 1,
    headerCount: header.filter(Boolean).length,
    updatedAt: getByHeader_(targetRow, idx, ['更新日時', '最終更新', '最終更新日時']),
    summary,
    personalRows,
    calendarRows,
    marketingRows,
    fieldMeta: buildFieldMeta_(values)
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
  return firstRows.includes('買取詳細') ||
    firstRows.includes('買取実績') ||
    firstRows.includes('販売詳細') ||
    firstRows.includes('在庫状況') ||
    firstRows.includes('受注納車') ||
    firstRows.includes('AA詳細');
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
    'Ｆ': 'F',
    'MQ': 'MQ',
    'ＭＱ': 'MQ',
    'G': 'G',
    'Ｇ': 'G',
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
    'AAQ': 'AAQ',
    '商品': '商品Q',
    '商品Q': '商品Q',
    'スクラップ': 'スクラップQ',
    'ｽｸﾗｯﾌﾟ': 'スクラップQ',
    'スクラップQ': 'スクラップQ',
    '代車': '代車Q',
    '代車Q': '代車Q',
    '即決成約': '即決契約数',
    '管理契約': '管理契約数',
    'キャンセルQ': '買取キャンセルQ',
    'キャンセルＱ': '買取キャンセルQ',
    '買取キャンセルQ': '買取キャンセルQ',
    '買取キャンセルＱ': '買取キャンセルQ',
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
    '出品Ｑ': '当月AA出品Q',
    '当月出品Q': '当月AA出品Q',
    '当月出品Ｑ': '当月AA出品Q',
    '当月買取出品Q': '当月買取出品Q',
    '当月買取出品Ｑ': '当月買取出品Q',
    '落札Q': 'AA落札Q',
    '落札Ｑ': 'AA落札Q',
    '流札Q': 'AA流札Q',
    '流札Ｑ': 'AA流札Q',
    '取消Q': 'AA取消Q',
    '取消Ｑ': 'AA取消Q',
    '未処理Q': 'AA未処理Q',
    '未処理Ｑ': 'AA未処理Q',
    '持越Q': 'AA翌月Q',
    '持越Ｑ': 'AA翌月Q',
    '持越台数': 'AA翌月Q',
    '赤字Q': 'AA赤字Q',
    '赤字Ｑ': 'AA赤字Q',
    '赤字比率': 'AA赤字比率',
    '落札MQ': '当月AAMQ',
    'AA@': 'AA@',
    'AA＠': 'AA@',
    '未処理MQ': 'AA未処理MQ',
    '赤字金額': 'AA赤字金額',
    'AA純MQ': 'AA純MQ',

    '在庫Q': '在庫台数',
    '在庫Ｑ': '在庫台数',
    '受注Q': '当月受注Ｑ',
    '受注Ｑ': '当月受注Ｑ',
    '販売済Q': '販売済Q',
    '販売済Ｑ': '販売済Q',
    '掲載Q': '掲載数',
    '掲載Ｑ': '掲載数',
    '未掲載Q': '未掲載数',
    '未掲載Ｑ': '未掲載数',
    '未入庫Q': '未入庫台数',
    '未入庫Ｑ': '未入庫台数',
    '未受入Q': '未受入Q',
    '未受入Ｑ': '未受入Q',
    '配車在庫Q': '配車在庫数',
    '配車在庫Ｑ': '配車在庫数',
    'キャパQ': 'キャパQ',
    'キャパＱ': 'キャパQ',
    'キャパ比率': 'キャパ比率',
    '在庫金額': '在庫金額',

    '納車台数': '当月納車Ｑ',
    '納車Q': '当月納車Ｑ',
    '納車Ｑ': '当月納車Ｑ',
    '未納車台数': '当月未納車Ｑ',
    '未納車Q': '当月未納車Ｑ',
    '未納車Ｑ': '当月未納車Ｑ',
    '翌月納車Q': '翌月納車Ｑ',
    '翌月納車Ｑ': '翌月納車Ｑ',
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
    ,
    '情報数': '情報数',
    '開示数': '開示数',
    '査定数': '査定数',
    '契約数': '成約数',
    '成約数': '成約数',
    '開示率': '開示率',
    '査定率': '査定率',
    '成約率': '成約率',
    '情報成約': '情報成約',
    '開示情報成約率': '開示情報成約率',
    '情報料金': '情報料金',
    '査定CPA': '査定CPA',
    '成約CPA': '成約CPA',
    '一人当たりの情報数': '一人当たり情報数',
    '一人当たり情報数': '一人当たり情報数',
    '直近層数': '直近層件数',
    '直近層件数': '直近層件数',
    '検討層数': '検討層件数',
    '検討層件数': '検討層件数',
    '潜在層数': '潜在層件数',
    '潜在層件数': '潜在層件数',
    '顕在層数': '潜在層件数',
    '顕在層件数': '潜在層件数',
    '目標': '目標',
    '月間日数': '月間日数',
    '経過日数': '経過日数',
    '残日数': '残日数',
    '日数進捗': '日数進捗',
    '日付': '日付',
    '受注': '受注',
    '査定': '査定',
    '契約': '契約',
    '氏名': '氏名',
    '個人名': '個人名',
    '拠点名': '拠点名',
    '役職': '役職',
    'ランク': 'ランク'
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
  applyFixedLinkOsCells_(summary, values);
  return summary;
}

function applyFixedLinkOsCells_(summary, values) {
  summary['固定セル補正'] = 'v2';
  getFixedLinkOsCells_().forEach(([key, a1]) => {
    const value = getCellByA1_(values, a1);
    const normalizedValue = value === '' || value === null || value === undefined ? 0 : value;
    summary[`確認_${a1}`] = value === '' || value === null || value === undefined ? '(空白->0)' : value;
    summary[key] = normalizedValue;
  });
}

function getFixedLinkOsCells_() {
  return [
    ['AA赤字金額', 'E16'],

    ['当月受注納車Q', 'E22'],
    ['前月受注納車Q', 'G22'],
    ['当月受注Ｑ', 'C20'],
    ['掲載数', 'E20'],
    ['未掲載数', 'F20'],
    ['未入庫台数', 'G20'],
    ['配車在庫数', 'I20'],
    ['キャパ比率', 'K20'],
    ['在庫金額', 'L20'],
    ['配車Q', 'L22'],
    ['販売総MQ', 'J24'],

    ['クレジットQ', 'B26'],
    ['クレジット比率', 'C26'],
    ['クレジットMQ', 'D26'],
    ['メンテナンスQ', 'E26'],
    ['メンテナンス比率', 'F26'],
    ['メンテナンスMQ', 'G26'],
    ['コーティングQ', 'H26'],
    ['コーティング比率', 'I26'],
    ['コーティングMQ', 'J26'],
    ['楽々納車Q', 'K26'],
    ['楽々納車比率', 'L26'],
    ['楽々納車MQ', 'M26'],
    ['保証Q', 'B28'],
    ['保証比率', 'C28'],
    ['保証MQ', 'D28'],
    ['クリーニングQ', 'E28'],
    ['クリーニング比率', 'F28'],
    ['クリーニングMQ', 'G28'],
    ['エアコンQ', 'H28'],
    ['エアコン比率', 'I28'],
    ['エアコンMQ', 'J28'],
    ['タイヤ交換Q', 'K28'],
    ['タイヤ交換比率', 'L28'],
    ['タイヤ交換MQ', 'M28'],

    ['情報数', 'M6'],
    ['開示数', 'N6'],
    ['査定数', 'O6'],
    ['査定率', 'P6'],
    ['契約数', 'Q6'],
    ['成約率', 'R6'],
    ['情報成約率', 'S6'],
    ['情報成約', 'S6'],
    ['開示情報成約率', 'T6'],
    ['開示率', 'U6'],
    ['情報料金', 'W6'],
    ['査定CPA', 'X6'],
    ['成約CPA', 'Y6'],
    ['一人当たりの情報数', 'Z6'],
    ['直近層数', 'AA6'],
    ['検討層数', 'AB6'],
    ['潜在層数', 'AC6'],

    ['G目標', 'P15'],
    ['MQ目標', 'P16'],
    ['買取Q目標', 'P17'],
    ['販売Q目標', 'P18'],
    ['落札MQ目標', 'P19'],
    ['販売総MQ目標', 'P20'],
    ['査定CVR目標', 'P21'],
    ['成約CVR目標', 'P22'],
    ['AA＠目標', 'P23'],
    ['納車＠目標', 'P24'],
    ['回転数目標', 'P25'],
    ['情報数目標', 'P26'],
    ['開示数目標', 'P27'],
    ['査定数目標', 'P28'],
    ['成約数目標', 'P29'],

    ['回転数予想', 'Q25'],
    ['情報数予想', 'Q26'],
    ['開示数予想', 'Q27'],
    ['査定数予想', 'Q28'],
    ['成約数予想', 'Q29'],

    ['TOPLINE', 'V2']
  ];
}

function buildFieldMeta_(values) {
  const meta = {};
  getFixedLinkOsCells_().forEach(([key, a1]) => {
    meta[key] = {
      trigger: a1,
      page: getDisplayPageForKey_(key),
      source: 'fixedCell'
    };
  });

  const aliases = {
    '営業部名': 'A2',
    'スタッフ数': 'B2',
    'F': 'C2',
    'MQ': 'D2',
    'G': 'E2',
    '拠点数': 'F2',
    '責任者': 'G2',
    'MG人数': 'H2',
    '買取営業': 'I2',
    '販売営業': 'J2',
    '事務': 'K2',
    '査定Ｑ': 'B6',
    '買取Ｑ': 'C6',
    '査定CVR': 'D6',
    '成約CVR': 'E6',
    'AAQ': 'B8',
    '商品Q': 'C8',
    'スクラップQ': 'D8',
    '代車Q': 'E8',
    'AA落札Q': 'B14',
    'AA流札Q': 'C14',
    'AA取消Q': 'D14',
    'AA未処理Q': 'E14',
    'AA翌月Q': 'F14',
    'AA赤字Q': 'G14',
    '当月AAMQ': 'B16',
    'AA@': 'C16',
    'AA未処理MQ': 'D16',
    '在庫台数': 'B20',
    '当月受注Ｑ': 'C20',
    '販売済Q': 'D20',
    '掲載数': 'E20',
    '未掲載数': 'F20',
    '未入庫台数': 'G20',
    '未受入Q': 'H20',
    '配車在庫数': 'I20',
    'キャパQ': 'J20',
    'キャパ比率': 'K20',
    '在庫金額': 'L20',
    '配車Q': 'L22',
    '当月納車Ｑ': 'B22',
    '当月未納車Ｑ': 'C22',
    '翌月納車Ｑ': 'D22',
    '前月受注納車Q': 'G22',
    '販売総MQ': 'J24',
    '情報数': 'M6',
    '開示数': 'N6',
    '査定数': 'O6',
    '成約数': 'Q6'
  };

  Object.keys(aliases).forEach(key => {
    if (!meta[key]) {
      meta[key] = {
        trigger: aliases[key],
        page: getDisplayPageForKey_(key),
        source: 'mappedCell'
      };
    }
  });
  meta['個人実績表'] = { trigger: 'A31:L63', page: '個人実績', source: 'tableRange' };
  meta['カレンダー表'] = { trigger: 'N31:X62', page: 'カレンダー', source: 'tableRange' };
  return meta;
}

function getDisplayPageForKey_(key) {
  if (['営業部名','スタッフ数','拠点数','責任者','MG人数','買取営業','販売営業','事務'].includes(key)) return '基本情報';
  if (['TOPLINE','G','MQ','F','査定Ｑ','買取Ｑ','販売Ｑ','情報数','在庫台数','スタッフ数','成約CVR'].includes(key)) return 'HOME';
  if (key.includes('AA') || key.includes('買取') || key.includes('査定') || key.includes('スクラップ') || key.includes('商品') || key.includes('代車') || key.includes('入庫') || key.includes('キャンセル')) return '買取詳細';
  if (key.includes('納車') || key.includes('在庫') || key.includes('販売') || key.includes('掲載') || key.includes('キャパ') || key.includes('クレジット') || key.includes('保証') || key.includes('メンテナンス') || key.includes('クリーニング') || key.includes('コーティング') || key.includes('エアコン') || key.includes('楽々') || key.includes('タイヤ')) return '販売詳細';
  if (key.includes('情報') || key.includes('開示') || key.includes('CPA') || key.includes('直近') || key.includes('検討') || key.includes('潜在')) return '情報詳細';
  if (key.includes('目標')) return '目標管理';
  return '設定';
}

function parseFixedTableRange_(values, rangeA1) {
  const range = parseA1Range_(rangeA1);
  if (!range) return [];
  const headerRow = values[range.startRow] || [];
  const headers = [];
  for (let c = range.startCol; c <= range.endCol; c++) {
    headers.push(String(headerRow[c] || '').trim());
  }

  return values.slice(range.startRow + 1, range.endRow + 1)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        if (!header) return;
        const value = row[range.startCol + i];
        obj[header] = value === undefined || value === null || value === '' ? 0 : value;
      });
      return obj;
    })
    .filter(row => Object.values(row).some(value => value !== 0 && value !== ''));
}

function parseMarketingAreaRows_(values) {
  const rows = [];
  const headerSignals = ['情報数', '開示数', '査定数', '査定率', '契約数', '成約率'];
  const labelBlock = new Set(['全体', '合計', '千葉', '埼玉', '東京', '神奈川', '大阪', '茨城', '北関東']);

  for (let r = 0; r < values.length - 1; r++) {
    for (let c = 0; c < values[r].length - 2; c++) {
      const label = String(values[r][c] || '').trim();
      if (!label || !labelBlock.has(label)) continue;

      const header = values[r].slice(c + 1, Math.min(values[r].length, c + 18)).map(v => String(v || '').trim());
      const hitCount = headerSignals.filter(signal => header.includes(signal)).length;
      if (hitCount < 3) continue;

      const valueRow = values[r + 1] || [];
      const obj = { エリア: label };
      header.forEach((h, i) => {
        if (!h) return;
        const value = valueRow[c + 1 + i];
        obj[h] = value === '' || value === null || value === undefined ? 0 : value;
      });
      rows.push(obj);
      break;
    }
  }

  return rows;
}

function parseA1Range_(rangeA1) {
  const match = String(rangeA1 || '').toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return null;
  return {
    startCol: a1ColumnToIndex_(match[1]),
    startRow: Number(match[2]) - 1,
    endCol: a1ColumnToIndex_(match[3]),
    endRow: Number(match[4]) - 1
  };
}

function getCellByA1_(values, a1) {
  const match = String(a1 || '').toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return '';
  const col = a1ColumnToIndex_(match[1]);
  const row = Number(match[2]) - 1;
  return values[row] && values[row][col] !== undefined ? values[row][col] : '';
}

function a1ColumnToIndex_(letters) {
  let n = 0;
  String(letters || '').split('').forEach(ch => {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  });
  return n - 1;
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
  const stockQ = toNumber_(summary['在庫台数']);
  if (stockQ) {
    setIfMissing_(summary, '未掲載比率', toNumber_(summary['未掲載数']) / stockQ);
    setIfMissing_(summary, '未受入比率', toNumber_(summary['未受入Q']) / stockQ);
    setIfMissing_(summary, '在庫金額平均', toNumber_(summary['在庫金額']) / stockQ);
  }
  const dispatchStockQ = toNumber_(summary['配車在庫数']);
  if (dispatchStockQ) {
    setIfMissing_(summary, '未入庫比率', toNumber_(summary['未入庫台数']) / dispatchStockQ);
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
