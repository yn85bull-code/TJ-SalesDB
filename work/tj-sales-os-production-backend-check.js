// TJ-SalesOS production backend
// Paste this into the Apps Script project that owns the 基幹データ spreadsheet.

const TJ_OS = {
  htmlFileName: 'SalesDeptDashboard',
  spreadsheetId: '1uzzA7hHHPS1WaEACwKK82XL8cuEy4LQmAP_jiz7ycoE',
  mode: 'production',
  sheets: {
    dashboard: ['営業部別集計', '営業部DASH_DB', '営業部別集計表', '営業部集計'],
    daily: ['営業部DASH_日別', '日別集計', '日報', '日別'],
    members: ['営業部DASH_個人', '個人別集計', '個人別実績', '個人別'],
    stores: ['拠点名リンク', '拠点名リック', '店舗別集計', '拠点別集計', '営業部DASH_拠点', '店舗別', '拠点一覧', '店舗一覧'],
    employees: ['社員名簿リンク', '社員名簿', '社員管理', '社員一覧'],
    targets: ['目標設定', '営業部DASH_目標', '設定'],
    salesInventory: ['販売本部DASH_DB', '商品販売在庫一覧', '店舗別集計'],
    flash: 'TJ速報',
    dailyArchive: 'TJ日報アーカイブ',
    monthlyArchive: 'TJ月締めレポート'
  },
  deptAliases: ['営業部名', '営業部一覧', '営業部', '部署', '部門', '対象部署', '__X'],
  storeAliases: ['拠点名', '店舗名', '店舗', '拠点', '所属', '所属拠点', '拠点名リンク'],
  monthAliases: ['対象月', '月', '年月'],
  updatedAliases: ['更新日時', '最終更新', '更新日', '更新']
};

function doGet(e) {
  if (e && e.parameter && e.parameter.debug) {
    const payload = debugTjOsLiveSample_(e.parameter.dept || '千葉営業部');
    return ContentService
      .createTextOutput(JSON.stringify(payload, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService
    .createHtmlOutputFromFile(TJ_OS.htmlFileName)
    .setTitle('TJ-SalesOS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSalesDeptOptions() {
  const rows = getSheetObjectsByRole_('dashboard');
  const names = unique_(rows.map(row => pickText_(row, TJ_OS.deptAliases)).filter(Boolean));
  const salesNames = names.filter(name => /営業部/.test(name));
  const head = names.includes('本部') ? ['本部'] : ['本部'];
  const service = names.includes('サービス') ? ['サービス'] : ['サービス'];
  return unique_(head.concat(service, salesNames.length ? salesNames : names.filter(name => !['本部', 'サービス'].includes(name))));
}

function getSalesDeptDashboard(deptName) {
  const selectedDept = String(deptName || getSalesDeptOptions()[0] || '本部');
  const rows = getSheetObjectsByRole_('dashboard');
  const summary = buildDeptSummary_(rows, selectedDept);
  getSalesInventoryRowsForDept_(selectedDept).forEach(row => mergeNumericInto_(summary, row));
  normalizeSalesKeys_(summary);
  return {
    options: getSalesDeptOptions(),
    selectedDept: selectedDept,
    summary: summary,
    kpis: [],
    progress: buildProgressRows_(summary),
    updatedAt: summary['更新日時'] || nowText_()
  };
}

function getSalesDeptDaily(deptName) {
  const selectedDept = String(deptName || '本部');
  return filterRowsForDept_(getSheetObjectsByRole_('daily'), selectedDept).map(normalizeDailyRow_);
}

function getSalesDeptMembers(deptName) {
  const selectedDept = String(deptName || '本部');
  return filterRowsForDept_(getSheetObjectsByRole_('members'), selectedDept).map(normalizeMemberRow_);
}

function getSalesDeptStores(deptName) {
  const selectedDept = String(deptName || '本部');
  const byStore = {};

  [
    filterRowsForDept_(getSheetObjectsByRole_('stores'), selectedDept),
    filterRowsForDept_(getSheetObjectsByRole_('dashboard'), selectedDept),
    getSalesDeptMembers(selectedDept),
    getSalesInventoryRowsForDept_(selectedDept)
  ].forEach(rows => rows.forEach(row => {
    const store = pickText_(row, TJ_OS.storeAliases) || row['拠点名'] || row['店舗名'] || row['所属'] || '未設定';
    if (!byStore[store]) byStore[store] = { '拠点名': store };
    mergeNumericInto_(byStore[store], row);
  }));

  return Object.keys(byStore).map(key => normalizeStoreRow_(byStore[key]));
}

function getSalesEmployeeDirectory(deptName) {
  const selectedDept = String(deptName || '本部');
  return filterRowsForDept_(getSheetObjectsByRole_('employees'), selectedDept).map(normalizeEmployeeRow_);
}

function getTargetSettings(deptName) {
  const selectedDept = String(deptName || '本部');
  const rows = filterRowsForDept_(getSheetObjectsByRole_('targets'), selectedDept);
  if (!rows.length) return {};
  const out = {};
  rows.forEach(row => {
    const key = pickText_(row, ['項目', '目標項目', 'KPI', '名称']);
    const value = pickValue_(row, ['値', '目標', '設定値', '目標値']);
    if (key) out[key] = value;
    Object.keys(row).forEach(header => {
      if (row[header] !== '' && !TJ_OS.deptAliases.includes(header)) out[header] = row[header];
    });
  });
  return out;
}

function buildSalesDeptDashboardAllDbs() {
  SpreadsheetApp.flush();
  return { ok: true, updatedAt: nowText_(), message: '基幹データ参照型のため、OS側DB再生成はスキップしました。' };
}

function buildPurchaseHqDashboardDb() {
  SpreadsheetApp.flush();
  return { ok: true, updatedAt: nowText_(), message: '買取詳細は営業部DASH_DBを直接参照します。' };
}

function getPurchaseHqDashboard(deptName) {
  const selectedDept = String(deptName || '本部');
  const dashboard = getSalesDeptDashboard(selectedDept);
  return {
    options: getSalesDeptOptions(),
    selectedDept: selectedDept,
    summary: dashboard.summary,
    rows: filterRowsForDept_(getSheetObjectsByRole_('dashboard'), selectedDept)
  };
}

function getSalesHqDashboardData() {
  const rows = getSalesDeptStores('本部');
  const totals = {};
  rows.forEach(row => mergeNumericInto_(totals, row));
  normalizeSalesKeys_(totals);
  return { updatedAt: nowText_(), totals: totals, rows: rows };
}

function refreshSalesHqDashboardData() {
  return getSalesHqDashboardData();
}

function resetSalesHqMonthStartStock() {
  PropertiesService.getScriptProperties().setProperty('TJ_OS_MONTH_START_STOCK_RESET_AT', nowText_());
  return { ok: true, updatedAt: nowText_() };
}

function saveSalesFlashReport(payload) {
  const sheet = ensureSheet_(
    TJ_OS.sheets.flash,
    ['登録日時', '種別', '営業部', '氏名', '車名', '媒体', '買値', '販路区分', '粗利', '備考']
  );
  const data = payload || {};
  sheet.appendRow([
    new Date(),
    data.type || '',
    data.dept || '',
    data.name || '',
    data.carName || '',
    data.media || '',
    data.buyPrice || '',
    data.route || '',
    data.grossProfit || '',
    data.memo || ''
  ]);
  return { ok: true, updatedAt: nowText_() };
}

function saveDailyPerformanceReport(payload) {
  const sheet = ensureSheet_(
    TJ_OS.sheets.dailyArchive,
    ['保存日時', '対象月', '対象日', '営業部', 'TOPLINE', 'G', 'MQ', '査定Q', '買取Q', '販売Q', 'JSON']
  );
  const data = payload || {};
  sheet.appendRow([
    new Date(),
    data.month || '',
    data.date || '',
    data.dept || '',
    valueFromAny_(data, ['topline', 'TOPLINE', '売上']),
    valueFromAny_(data, ['g', 'G']),
    valueFromAny_(data, ['mq', 'MQ', 'トータルMQ']),
    valueFromAny_(data, ['assessmentQ', '査定Q', '査定台数実績']),
    valueFromAny_(data, ['purchaseQ', '買取Q', '買取台数実績']),
    valueFromAny_(data, ['salesQ', '販売Q', '販売台数実績']),
    JSON.stringify(data)
  ]);
  return { ok: true, updatedAt: nowText_() };
}

function saveMonthlyPerformanceReport(payload) {
  const sheet = ensureSheet_(
    TJ_OS.sheets.monthlyArchive,
    ['保存日時', '対象月', '営業部', '保存種別', 'JSON']
  );
  const data = payload || {};
  sheet.appendRow([new Date(), data.month || '', data.dept || '', data.type || 'monthly', JSON.stringify(data)]);
  return { ok: true, updatedAt: nowText_() };
}

function installDailyPerformanceReportTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'autoSaveDailyPerformanceReport')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('autoSaveDailyPerformanceReport')
    .timeBased()
    .everyDays(1)
    .atHour(23)
    .nearMinute(59)
    .create();

  return { ok: true, message: '23:59付近の日報自動保管トリガーを作成しました。' };
}

function autoSaveDailyPerformanceReport() {
  getSalesDeptOptions().forEach(dept => {
    const dash = getSalesDeptDashboard(dept);
    const s = dash.summary || {};
    saveDailyPerformanceReport({
      type: 'auto',
      month: s['対象月'] || currentMonthText_(),
      date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd'),
      dept: dept,
      topline: s['売上'] || s['TOPLINE'] || 0,
      g: s['G'] || 0,
      mq: s['トータルMQ'] || s['MQ'] || 0,
      assessmentQ: s['査定Q'] || s['査定台数実績'] || 0,
      purchaseQ: s['買取Q'] || s['買取台数実績'] || 0,
      salesQ: s['販売Q'] || s['販売台数実績'] || 0
    });
  });
}

function getSheetObjectsByRole_(role) {
  const sheet = findSheet_(TJ_OS.sheets[role]);
  if (!sheet) return [];
  return sheetToObjects_(sheet);
}

function getTargetSpreadsheet_() {
  if (TJ_OS.spreadsheetId) return SpreadsheetApp.openById(TJ_OS.spreadsheetId);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function findSheet_(names) {
  const ss = getTargetSpreadsheet_();
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const sheet = ss.getSheetByName(name);
    if (sheet) return sheet;
  }

  const normalizedNames = list.map(normalizeHeader_);
  return ss.getSheets().find(sheet => normalizedNames.includes(normalizeHeader_(sheet.getName())))
    || ss.getSheets().find(sheet => {
      const sheetName = normalizeHeader_(sheet.getName());
      return normalizedNames.some(name => sheetName.includes(name) || name.includes(sheetName));
    })
    || null;
}

function ensureSheet_(name, headers) {
  const ss = getTargetSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  if (/拠点名リ?ンク/.test(sheet.getName()) || sheet.getName() === '拠点名リック') {
    return storeLinkSheetToObjects_(values);
  }
  const headers = values[0].map(header => String(header || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj['__' + columnName_(index + 1)] = row[index];
        if (header) obj[header] = row[index];
      });
      return obj;
    });
}

function columnName_(num) {
  let name = '';
  while (num > 0) {
    const rem = (num - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    num = Math.floor((num - 1) / 26);
  }
  return name;
}

function storeLinkSheetToObjects_(values) {
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => ({
      '拠点名': row[0] || '',
      '営業部名': row[21] || '',
      '店舗名': row[0] || '',
      '所属': row[0] || ''
    }))
    .filter(row => row['拠点名'] || row['営業部名']);
}

function buildDeptSummary_(rows, deptName) {
  const selectedRows = filterRowsForDept_(rows, deptName);
  const summary = {};
  selectedRows.forEach(row => mergeNumericInto_(summary, row));

  const first = selectedRows[0] || {};
  Object.keys(first).forEach(key => {
    if (!(key in summary) || summary[key] === 0) summary[key] = first[key];
  });

  summary['営業部名'] = deptName;
  summary['対象月'] = pickText_(first, TJ_OS.monthAliases) || getMappedTargetMonth_() || currentMonthText_();
  summary['更新日時'] = pickText_(first, TJ_OS.updatedAliases) || nowText_();
  normalizeCommonKeys_(summary);
  applyDashboardColumnOverrides_(summary, first);
  return summary;
}

function filterRowsForDept_(rows, deptName) {
  const target = String(deptName || '本部');
  if (target === '本部') {
    const salesRows = rows.filter(row => {
      const dept = pickText_(row, TJ_OS.deptAliases);
      return /営業部/.test(dept) && !/本部|サービス/.test(dept);
    });
    return salesRows.length ? salesRows : rows.filter(row => !/サービス/.test(pickText_(row, TJ_OS.deptAliases)));
  }
  const exact = rows.filter(row => pickText_(row, TJ_OS.deptAliases) === target);
  if (exact.length) return exact.slice(0, 1);
  const partial = rows.filter(row => pickText_(row, TJ_OS.deptAliases).includes(target));
  return partial.length ? partial.slice(0, 1) : [];
}

function applyDashboardColumnOverrides_(summary, first) {
  if (!first) return;
  const fixed = {
    '売上': '__FK',
    'TOPLINE': '__FK',
    'G': '__FL',
    'トータルMQ': '__DC',
    'MQ': '__DC',
    'トータルF': '__DN',
    'F': '__DN',
    '査定Q': '__B',
    '査定台数実績': '__B',
    '買取Q': '__C',
    '買取台数実績': '__C',
    '販売Q': '__AC',
    '販売台数実績': '__AC',
    '成約CVR': '__D',
    '買取成約CVR': '__D',
    'AA@': '__E',
    'AA割合': '__J',
    '展示割合': '__K',
    '査定CVR': '__EB',
    '販売@': '__FM',
    'スタッフ数': '__FN'
  };
  Object.keys(fixed).forEach(key => {
    const value = first[fixed[key]];
    summary[key] = value === undefined ? '' : value;
  });
}

function getSalesInventoryRowsForDept_(deptName) {
  const rows = getSheetObjectsByRole_('salesInventory').map(normalizeSalesInventoryRow_);
  const direct = filterRowsForDept_(rows, deptName);
  if (direct.length) return direct;

  const target = String(deptName || '本部');
  const storeDept = getStoreDeptMap_();
  if (target === '本部') {
    return rows.filter(row => !/サービス/.test(storeDept[pickText_(row, TJ_OS.storeAliases)] || pickText_(row, TJ_OS.deptAliases)));
  }
  return rows.filter(row => {
    const store = pickText_(row, TJ_OS.storeAliases);
    const dept = storeDept[store] || pickText_(row, TJ_OS.deptAliases);
    return dept === target || String(dept || '').includes(target);
  });
}

function getStoreDeptMap_() {
  const map = {};
  getSheetObjectsByRole_('stores').forEach(row => {
    const store = pickText_(row, TJ_OS.storeAliases);
    const dept = pickText_(row, TJ_OS.deptAliases);
    if (store && dept) map[store] = dept;
  });
  return map;
}

function getMappedTargetMonth_() {
  const sheet = findSheet_(TJ_OS.sheets.stores);
  if (!sheet) return '';
  const value = sheet.getRange('Z1').getDisplayValue();
  return value || '';
}

function normalizeCommonKeys_(s) {
  setFirst_(s, '売上', ['売上', 'TOPLINE', '販売TOPLINE', '総売上', '__FK']);
  s['TOPLINE'] = s['売上'];
  setFirst_(s, 'G', ['G', '粗利', '総粗利', '__FL']);
  setFirst_(s, 'トータルMQ', ['トータルMQ', 'MQ', '総MQ', '__DC']);
  s['MQ'] = s['トータルMQ'];
  setFirst_(s, 'トータルF', ['トータルF', 'F', '総F', '__DN']);
  s['F'] = s['トータルF'];
  setFirst_(s, '査定Q', ['査定Q', '査定台数実績', '査定数', '査定件数', '__B']);
  setFirst_(s, '査定台数実績', ['査定台数実績', '査定Q', '__B']);
  setFirst_(s, '買取Q', ['買取Q', '買取台数実績', '買取数', '成約数', '__C']);
  setFirst_(s, '買取台数実績', ['買取台数実績', '買取Q', '__C']);
  setFirst_(s, '販売Q', ['販売Q', '販売台数実績', '納車Q', '納車台数実績', '__AC']);
  setFirst_(s, '販売台数実績', ['販売台数実績', '販売Q', '__AC']);
  setFirst_(s, '査定CVR', ['査定CVR', '査定率', '__EB']);
  setFirst_(s, '成約CVR', ['成約CVR', '買取成約CVR', '成約率', '__D']);
  setFirst_(s, '買取成約CVR', ['買取成約CVR', '成約CVR', '__D']);
  setFirst_(s, 'AA@', ['AA@', 'AA＠', 'AA平均粗利', '__E']);
  setFirst_(s, '販売@', ['販売@', '販売＠', '販売平均粗利', '__FM']);
  setFirst_(s, 'AA割合', ['AA割合', 'AA比率', '__J']);
  setFirst_(s, '展示割合', ['展示割合', '展示比率', '__K']);
  setFirst_(s, 'スタッフ数', ['スタッフ数', 'スタッフ人数', '__FN']);
  setFirst_(s, 'MOTA情報数', ['MOTA情報数', 'MOTA総数', 'モータ情報数', 'モータ総数', '買取情報数', '情報数', '総情報数']);
  setFirst_(s, 'MOTA開示数', ['MOTA開示数', 'MOTA総開示数', 'モータ開示数', '総開示数', '開示数']);
  setFirst_(s, 'MOTA開示率', ['MOTA開示率', 'MOTA総開示率', 'モータ開示率', '総開示率', '開示率']);
  setFirst_(s, 'MOTA査定数', ['MOTA査定数', 'MOTA予約', 'モータ予約', 'モータ査定数']);
  setFirst_(s, 'MOTA成約数', ['MOTA成約数', 'MOTA契約数', 'MOTA契約', 'モータ契約', 'モータ成約数']);
  normalizeSalesKeys_(s);
}

function normalizeSalesKeys_(s) {
  setFirst_(s, '在庫台数', ['在庫台数', '商品在庫数', '展示車総数', '合計', '合計在庫', '総在庫', '__FC']);
  setFirst_(s, '配車在庫数', ['配車在庫数', '配車在庫台数', '合計', '合計在庫']);
  setFirst_(s, '未入庫台数', ['未入庫台数', '入庫前台数', '未入庫Q', '入庫前']);
  setFirst_(s, '掲載数', ['掲載数', '掲載台数', '展示中台数', '展示中']);
  setFirst_(s, '未掲載数', ['未掲載数', '未掲載Q']);
  setFirst_(s, '在庫金額', ['在庫金額', '在庫総額']);
  setFirst_(s, 'キャパ台数', ['キャパ台数', '在庫キャパ台数']);
  setFirst_(s, '販売Q', ['販売Q', '販売台数実績', '納車Q', '納車台数実績', '今月販売数', '販売済']);
  setFirst_(s, '納車Q', ['納車Q', '納車台数実績', '販売Q', '今月販売数']);
  setFirst_(s, '受注Q', ['受注Q', '当月受注Q', '当月受注Ｑ', '受注台数', '__AC']);
  setFirst_(s, '販売済', ['販売済']);
  setFirst_(s, '月初在庫', ['月初在庫']);
  setFirst_(s, '70%目標', ['70%目標', '70％目標']);
  setFirst_(s, '進捗率', ['進捗率']);
}

function normalizeSalesInventoryRow_(row) {
  const out = Object.assign({}, row);
  out['拠点名'] = pickText_(row, TJ_OS.storeAliases) || row['店舗'] || row['店舗名'] || row['拠点名'];
  out['営業部名'] = pickText_(row, TJ_OS.deptAliases);
  normalizeSalesKeys_(out);
  return out;
}

function normalizeDailyRow_(row) {
  const out = Object.assign({}, row);
  out['日付'] = pickText_(row, ['日付', '日', '対象日']) || row['日付'] || '';
  setFirst_(out, '情報数', ['情報数', '買取情報数', 'MOTA情報数', 'モータ情報数', 'MOTA総数', 'モータ総数', '総情報数', '問い合わせ数', '問合せ数']);
  normalizeCommonKeys_(out);
  return out;
}

function normalizeMemberRow_(row) {
  const out = Object.assign({}, row);
  out['氏名'] = pickText_(row, ['氏名', '名前', '社員名']);
  out['役職'] = pickText_(row, ['役職', '職位']);
  out['ランク'] = pickText_(row, ['ランク', '等級']);
  out['拠点名'] = pickText_(row, TJ_OS.storeAliases);
  normalizeCommonKeys_(out);
  return out;
}

function normalizeStoreRow_(row) {
  const out = Object.assign({}, row);
  out['拠点名'] = pickText_(row, TJ_OS.storeAliases);
  normalizeCommonKeys_(out);
  return out;
}

function normalizeEmployeeRow_(row) {
  return {
    '氏名': pickText_(row, ['氏名', '名前', '社員名']),
    '営業部名': pickText_(row, TJ_OS.deptAliases),
    '拠点名': pickText_(row, TJ_OS.storeAliases),
    '役職': pickText_(row, ['役職', '職位']),
    'ランク': pickText_(row, ['ランク', '等級']),
    '社歴': pickText_(row, ['社歴', '入社年月', '勤続年数']),
    '権限': pickText_(row, ['権限', '権限区分']),
    '雇用区分': pickText_(row, ['雇用区分', '区分'])
  };
}

function buildProgressRows_(s) {
  const labels = ['G', 'MQ', '査定Q', '買取Q', '販売Q', '査定CVR', '成約CVR'];
  return labels.map(label => {
    const target = valueFromAny_(s, [label + '目標', label.replace('Q', '') + '目標']) || 0;
    const actual = valueFromAny_(s, [label, label === 'MQ' ? 'トータルMQ' : label]) || 0;
    const rate = parseNumber_(target) ? Math.round(parseNumber_(actual) / parseNumber_(target) * 1000) / 10 : 0;
    return { label: label, target: target, actual: actual, rate: rate };
  });
}

function mergeNumericInto_(target, row) {
  Object.keys(row || {}).forEach(key => {
    const value = row[key];
    const parsed = parseNumber_(value);
    if (value !== '' && !isNaN(parsed) && !isMetaKey_(key)) {
      target[key] = parseNumber_(target[key]) + parsed;
    } else if (!(key in target) && value !== '') {
      target[key] = value;
    }
  });
}

function isMetaKey_(key) {
  return TJ_OS.deptAliases.concat(TJ_OS.storeAliases, TJ_OS.monthAliases, TJ_OS.updatedAliases, ['氏名', '役職', 'ランク', '社歴']).includes(key);
}

function setFirst_(obj, key, aliases) {
  const value = valueFromAny_(obj, aliases);
  if (value !== '' && value !== null && value !== undefined) obj[key] = value;
  if (obj[key] === undefined) obj[key] = 0;
}

function pickValue_(row, aliases) {
  return valueFromAny_(row, aliases);
}

function pickText_(row, aliases) {
  const value = valueFromAny_(row, aliases);
  return String(value || '').trim();
}

function valueFromAny_(row, aliases) {
  if (!row) return '';
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== '') return row[alias];
  }
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const normalized = normalizeHeader_(alias);
    const found = keys.find(key => normalizeHeader_(key) === normalized);
    if (found && row[found] !== '') return row[found];
  }
  for (const alias of aliases) {
    const normalized = normalizeHeader_(alias);
    const found = keys.find(key => normalizeHeader_(key).includes(normalized) || normalized.includes(normalizeHeader_(key)));
    if (found && row[found] !== '') return row[found];
  }
  return '';
}

function parseNumber_(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const text = String(value).replace(/[¥￥,\s台件Q%]/g, '');
  if (text === '' || text === '-') return 0;
  const n = Number(text);
  return isNaN(n) ? 0 : n;
}

function normalizeHeader_(value) {
  return String(value || '').replace(/\s/g, '').replace(/[（）()・_/@]/g, '').toLowerCase();
}

function unique_(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function currentMonthText_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM');
}

function nowText_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm');
}

function debugTjOsLiveSample_(deptName) {
  const ss = getTargetSpreadsheet_();
  const dashboardSheet = findSheet_(TJ_OS.sheets.dashboard);
  const rows = getSheetObjectsByRole_('dashboard');
  const matchedRows = rows.filter(row => pickText_(row, TJ_OS.deptAliases) === String(deptName || ''));
  const first = matchedRows[0] || {};
  const dash = getSalesDeptDashboard(deptName);
  return {
    ok: true,
    mode: TJ_OS.mode,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    dashboardSheet: dashboardSheet ? dashboardSheet.getName() : '',
    dashboardRows: rows.length,
    matchedRows: matchedRows.length,
    dept: deptName,
    rawMatchedFirst: {
      deptByAliases: pickText_(first, TJ_OS.deptAliases),
      X: first['__X'],
      B: first['__B'],
      C: first['__C'],
      D: first['__D'],
      E: first['__E'],
      J: first['__J'],
      K: first['__K'],
      AC: first['__AC'],
      DC: first['__DC'],
      DN: first['__DN'],
      EB: first['__EB'],
      FK: first['__FK'],
      FL: first['__FL'],
      FM: first['__FM'],
      FN: first['__FN'],
      FC: first['__FC'],
      keysPreview: Object.keys(first).slice(0, 80)
    },
    options: getSalesDeptOptions(),
    summary: dash.summary,
    checks: {
      MQ: dash.summary['MQ'],
      assessmentQ: dash.summary['査定Q'],
      purchaseQ: dash.summary['買取Q'],
      salesQ: dash.summary['販売Q'],
      contractCvr: dash.summary['成約CVR'],
      assessmentCvr: dash.summary['査定CVR'],
      staff: dash.summary['スタッフ数'],
      orderQ: dash.summary['受注Q'],
      stockQ: dash.summary['在庫台数']
    },
    generatedAt: nowText_()
  };
}
