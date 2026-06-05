// TJ-SalesOS production backend
// Paste this into the Apps Script project that owns the 基幹データ spreadsheet.

const TJ_OS = {
  htmlFileName: 'tj-sales-os-demo',
  sheets: {
    dashboard: ['営業部DASH_DB', '営業部別集計', '営業部別集計表', '営業部集計'],
    daily: ['営業部DASH_日別', '日別集計', '日報', '日別'],
    members: ['営業部DASH_個人', '個人別集計', '個人別実績', '個人別'],
    stores: ['店舗別集計', '拠点別集計', '営業部DASH_拠点', '店舗別'],
    employees: ['社員名簿', '社員管理', '社員一覧'],
    targets: ['目標設定', '営業部DASH_目標', '設定'],
    salesInventory: ['販売本部DASH_DB', '商品販売在庫一覧', '店舗別集計'],
    flash: 'TJ速報',
    dailyArchive: 'TJ日報アーカイブ',
    monthlyArchive: 'TJ月締めレポート'
  },
  deptAliases: ['営業部名', '営業部', '部署', '部門', '対象部署'],
  storeAliases: ['拠点名', '店舗名', '店舗', '拠点', '所属'],
  monthAliases: ['対象月', '月', '年月'],
  updatedAliases: ['更新日時', '最終更新', '更新日', '更新']
};

function doGet(e) {
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
  const storeRows = filterRowsForDept_(getSheetObjectsByRole_('stores'), selectedDept);
  if (storeRows.length) return storeRows.map(normalizeStoreRow_);

  const members = getSalesDeptMembers(selectedDept);
  const byStore = {};
  members.forEach(row => {
    const store = row['拠点名'] || row['店舗名'] || row['所属'] || '未設定';
    if (!byStore[store]) byStore[store] = { '拠点名': store };
    mergeNumericInto_(byStore[store], row);
  });
  return Object.keys(byStore).map(key => byStore[key]);
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

function findSheet_(names) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const sheet = ss.getSheetByName(name);
    if (sheet) return sheet;
  }

  const normalizedNames = list.map(normalizeHeader_);
  return ss.getSheets().find(sheet => normalizedNames.includes(normalizeHeader_(sheet.getName()))) || null;
}

function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(header => String(header || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) obj[header] = row[index];
      });
      return obj;
    });
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
  summary['対象月'] = pickText_(first, TJ_OS.monthAliases) || currentMonthText_();
  summary['更新日時'] = pickText_(first, TJ_OS.updatedAliases) || nowText_();
  normalizeCommonKeys_(summary);
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
  return rows.filter(row => pickText_(row, TJ_OS.deptAliases) === target || pickText_(row, TJ_OS.deptAliases).includes(target));
}

function normalizeCommonKeys_(s) {
  setFirst_(s, '売上', ['売上', 'TOPLINE', '販売TOPLINE', '総売上']);
  s['TOPLINE'] = s['売上'];
  setFirst_(s, 'G', ['G', '粗利', '総粗利']);
  setFirst_(s, 'トータルMQ', ['トータルMQ', 'MQ', '総MQ']);
  s['MQ'] = s['トータルMQ'];
  setFirst_(s, 'トータルF', ['トータルF', 'F', '総F']);
  s['F'] = s['トータルF'];
  setFirst_(s, '査定Q', ['査定Q', '査定台数実績', '査定数', '査定件数']);
  setFirst_(s, '買取Q', ['買取Q', '買取台数実績', '買取数', '成約数']);
  setFirst_(s, '販売Q', ['販売Q', '販売台数実績', '納車Q', '納車台数実績']);
  setFirst_(s, '査定CVR', ['査定CVR', '査定率']);
  setFirst_(s, '成約CVR', ['成約CVR', '買取成約CVR', '成約率']);
  setFirst_(s, 'AA@', ['AA@', 'AA平均粗利']);
  setFirst_(s, '販売@', ['販売@', '販売平均粗利']);
  normalizeSalesKeys_(s);
}

function normalizeSalesKeys_(s) {
  setFirst_(s, '在庫台数', ['在庫台数', '商品在庫数', '展示車総数']);
  setFirst_(s, '配車在庫数', ['配車在庫数', '配車在庫台数']);
  setFirst_(s, '未入庫台数', ['未入庫台数', '入庫前台数', '未入庫Q']);
  setFirst_(s, '掲載数', ['掲載数', '掲載台数', '展示中台数']);
  setFirst_(s, '未掲載数', ['未掲載数', '未掲載Q']);
  setFirst_(s, '在庫金額', ['在庫金額', '在庫総額']);
  setFirst_(s, 'キャパ台数', ['キャパ台数', '在庫キャパ台数']);
}

function normalizeDailyRow_(row) {
  const out = Object.assign({}, row);
  out['日付'] = pickText_(row, ['日付', '日', '対象日']) || row['日付'] || '';
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
