// ==========================================
// TJ-SalesOS WEB
// Lightweight GAS dashboard using prebuilt DASH sheets.
// ==========================================

const SALES_DEPT_DASH = {
  sheets: {
    sourceDept: '蝟ｶ讌ｭ驛ｨ蛻･髮・ｨ・,
    sourceStore: '蠎苓・蛻･髮・ｨ・,
    sourcePersonal: '蛟倶ｺｺ蛻･髮・ｨ・,
    sourceEmployee: '遉ｾ蜩｡蜷咲ｰｿ',
    sourceDaily: '譌･蛻･髮・ｨ・,
    dashDb: '蝟ｶ讌ｭ驛ｨDASH_DB',
    dashDaily: '蝟ｶ讌ｭ驛ｨDASH_譌･蛻･',
    dashPersonal: '蝟ｶ讌ｭ驛ｨDASH_蛟倶ｺｺ',
    dashTarget: '蝟ｶ讌ｭ驛ｨDASH_逶ｮ讓・
  },
  cacheSeconds: 120
};

const SALES_DEPT_DASH_DB_HEADERS = [
  '蟇ｾ雎｡譛・, '譖ｴ譁ｰ譌･譎・, '蝟ｶ讌ｭ驛ｨ蜷・,
  '莉頑怦譌･謨ｰ', '邨碁℃譌･謨ｰ', '譌･謨ｰ騾ｲ謐・,
  '繧ｹ繧ｿ繝・ヵ謨ｰ', '蟷ｳ蝮①', '謌千ｴ・紫', 'AA蜑ｲ蜷・, '螻慕､ｺ蜑ｲ蜷・,
  '雋ｬ莉ｻ閠・ｺｺ謨ｰ', '雋ｷ蜿門霧讌ｭ莠ｺ謨ｰ', '雋ｩ螢ｲ蝟ｶ讌ｭ莠ｺ謨ｰ', '莠句漁莠ｺ謨ｰ', '縺昴・莉紋ｺｺ謨ｰ',
  '繝医・繧ｿ繝ｫMQ', '繝医・繧ｿ繝ｫF', 'G', '螢ｲ荳・,
  'AAMQ', 'AA邏熱Q', '雋ｩ螢ｲMQ', '雋ｩ螢ｲ邏熱Q', '邏崎ｻ頑ｸ・Q', '譛ｪ邏崎ｻ凱Q',
  '莉伜ｸｯMQ', '莉伜ｸｯ邱舟Q', 'KBMQ', '繧ｹ繧ｯ繝ｩ繝・・MQ', '繧ｯ繝ｬ繧ｸ繝・ヨMQ',
  '蝗ｺ螳夊ｲｻ', '螂醍ｴ・≡', '莠ｺ莉ｶ雋ｻ', '螂ｨ蜉ｱ驥・, '諠・ｱ譁・, '謗ｲ霈画侭', 'CC驕句霧雋ｻ', '雋ｩ邂｡雋ｻ', '蠎・相雋ｻ', '縺昴・莉也ｵ瑚ｲｻ',
  '雋ｷ蜿匁ュ蝣ｱ謨ｰ', '髢狗､ｺ謨ｰ', '譟ｻ螳壼床謨ｰ螳溽ｸｾ', '雋ｷ蜿門床謨ｰ螳溽ｸｾ',
  '譟ｻ螳咾VR', '雋ｷ蜿匁・邏ГVR', '雋ｷ蜿匁ュ蝣ｱ謌千ｴ・紫', '譟ｻ螳咾VR逶ｮ讓・, '謌千ｴГVR逶ｮ讓・,
  'AA蜃ｦ逅・', 'AA譛ｪ蜃ｦ逅・', 'AA蟷ｳ蝮・ｲ怜茜', 'AA@',
  '雋ｷ蜿鵬逶ｮ讓・, '雋ｷ蜿鵬騾ｲ謐・, '譟ｻ螳啣逶ｮ讓・, '譟ｻ螳啣騾ｲ謐・, 'AAQ逶ｮ讓・, 'AAQ騾ｲ謐・,
  'AA蜿ｰ謨ｰ', '螻慕､ｺ蜿ｰ謨ｰ', '繧ｹ繧ｯ繝ｩ繝・・蜿ｰ謨ｰ', '莉｣霆雁床謨ｰ', '蝟ｶ讌ｭ霆雁床謨ｰ', '縺昴・莉門床謨ｰ',
  '關ｽ譛ｭ蜿ｰ謨ｰ', '豬∵惆蜿ｰ謨ｰ', '蜿匁ｶ亥床謨ｰ', '鄙梧怦蜿ｰ謨ｰ', '關ｽ譛ｭ邇・, '豬∵惆邇・, '蜿匁ｶ育紫',
  '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ', '蜿玲ｳｨQ', '邏崎ｻ雁床謨ｰ螳溽ｸｾ', '雋ｩ螢ｲQ逶ｮ讓・, '雋ｩ螢ｲQ騾ｲ謐・,
  '繧ｯ繝ｬ繧ｸ繝・ヨ莉ｶ謨ｰ', '繧ｯ繝ｬ繧ｸ繝・ヨ豈皮紫', '菫晁ｨｼ莉ｶ謨ｰ', '菫晁ｨｼ豈皮紫',
  '繝｡繝ｳ繝・リ繝ｳ繧ｹ莉ｶ謨ｰ', '繝｡繝ｳ繝・リ繝ｳ繧ｹ豈皮紫', '繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ莉ｶ謨ｰ', '繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ豈皮紫',
  '繧ｨ繧｢繧ｳ繝ｳ莉ｶ謨ｰ', '繧ｨ繧｢繧ｳ繝ｳ豈皮紫', '讌ｽ縲・ｴ崎ｻ贋ｻｶ謨ｰ', '讌ｽ縲・ｴ崎ｻ頑ｯ皮紫',
  '繧ｿ繧､繝､莠､謠帑ｻｶ謨ｰ', '繧ｿ繧､繝､莠､謠帶ｯ皮紫',
  '雋ｷ蜿匁ュ蝣ｱ謨ｰ逶ｮ讓・, '雋ｷ蜿匁ュ蝣ｱ謨ｰ騾ｲ謐・, 'MQ逶ｮ讓・, 'MQ騾ｲ謐・, 'F逶ｮ讓・, 'F騾ｲ謐・,
  'G逶ｮ讓・, 'G騾ｲ謐・, '莠育ｴ・焚逶ｮ讓・, '莠育ｴ・焚騾ｲ謐・, '螂醍ｴ・焚逶ｮ讓・, '螂醍ｴ・焚騾ｲ謐・,
  '豎ｺ陬∵焚逶ｮ讓・, '豎ｺ陬∵焚騾ｲ謐・
];

const SALES_DEPT_DAILY_HEADERS = [
  '蟇ｾ雎｡譛・, '蝟ｶ讌ｭ驛ｨ蜷・, '譌･莉・, '譖懈律',
  '譟ｻ螳壻ｻｶ謨ｰ', '雋ｷ蜿紋ｻｶ謨ｰ', '雋ｩ螢ｲ莉ｶ謨ｰ', '螂醍ｴ・ｻｶ謨ｰ',
  '雋ｷ蜿匁・邏ГVR', '譟ｻ螳咾VR', 'MQ', 'F', 'G'
];

const SALES_DEPT_PERSONAL_HEADERS = [
  '蟇ｾ雎｡譛・, '蝟ｶ讌ｭ驛ｨ蜷・, '諡轤ｹ蜷・, '豌丞錐', '蠖ｹ閨ｷ', '繝ｩ繝ｳ繧ｯ',
  '譟ｻ螳啣', '雋ｷ蜿鵬', '謌千ｴ・紫', 'MQ',
  '莠育ｴ・焚', '莠育ｴ・･醍ｴ・焚', '豎ｺ陬∵焚',
  '逶ｮ讓呎渊螳壽焚', '逶ｮ讓呵ｲｷ蜿匁焚', '逶ｮ讓吝･醍ｴ・焚', '逶ｮ讓吩ｺ育ｴ・焚', '逶ｮ讓呎ｱｺ陬∵焚',
  '譟ｻ螳夐ｲ謐・, '雋ｷ蜿夜ｲ謐・, 'MQ騾ｲ謐・, '逶ｮ讓吝ｷｮ蛻・, 'MQ蟾ｮ蛻・
];

const SALES_DEPT_TARGET_HEADERS = [
  '蟇ｾ雎｡譛・, '遞ｮ蛻･', '蝟ｶ讌ｭ驛ｨ蜷・, '諡轤ｹ蜷・, '豌丞錐',
  '雋ｷ蜿匁ュ蝣ｱ謨ｰ逶ｮ讓・, '雋ｷ蜿鵬逶ｮ讓・, '譟ｻ螳啣逶ｮ讓・, 'AAQ逶ｮ讓・, '雋ｩ螢ｲQ逶ｮ讓・, '譟ｻ螳咾VR逶ｮ讓・, '謌千ｴГVR逶ｮ讓・,
  'MQ逶ｮ讓・, 'F逶ｮ讓・, 'G逶ｮ讓・, '莠育ｴ・焚逶ｮ讓・, '螂醍ｴ・焚逶ｮ讓・, '豎ｺ陬∵焚逶ｮ讓・
];

function doGet(e) {
  const page = e && e.parameter && e.parameter.page ? String(e.parameter.page) : 'salesDeptDashboard';
  if (page === 'salesDeptDashboard' || page === 'deptDash') {
    return HtmlService
      .createHtmlOutputFromFile('SalesDeptDashboard')
      .setTitle('TJ-SalesOS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Existing pages can be kept below when merging into current doGet(e).
  return HtmlService
    .createHtmlOutputFromFile('SalesDeptDashboard')
    .setTitle('TJ-SalesOS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function createSalesDeptDashboardSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashDb, SALES_DEPT_DASH_DB_HEADERS);
  ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashDaily, SALES_DEPT_DAILY_HEADERS);
  ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashPersonal, SALES_DEPT_PERSONAL_HEADERS);
  ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashTarget, SALES_DEPT_TARGET_HEADERS);
  return { ok: true };
}

function buildSalesDeptDashboardAllDbs() {
  createSalesDeptDashboardSheets();
  buildSalesDeptDashboardDb();
  buildSalesDeptDailyDb();
  buildSalesDeptPersonalDb();
  clearSalesDeptDashboardCache_();
  return { ok: true, updatedAt: new Date() };
}

function buildSalesDeptDashboardDb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceDept);
  if (!source) throw new Error('蝟ｶ讌ｭ驛ｨ蛻･髮・ｨ医す繝ｼ繝医′隕九▽縺九ｊ縺ｾ縺帙ｓ縲・);

  const target = ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashDb, SALES_DEPT_DASH_DB_HEADERS);
  const values = source.getDataRange().getDisplayValues();
  if (values.length < 2) return { ok: true, rows: 0 };

  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  const month = getSalesDeptTargetMonth_();
  const now = new Date();
  const days = getMonthProgress_();
  const targetMap = getTargetMap_();
  const staffCounts = getSalesDeptStaffCounts_();

  const rows = values.slice(1)
    .filter(row => getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・, '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']) || row[0])
    .map(row => {
      const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・, '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']) || row[0];
      const targets = targetMap[makeTargetKey_(month, '蝟ｶ讌ｭ驛ｨ', dept, '', '')] || {};
      const counts = staffCounts[dept] || {};
      const totalMq = firstNumber_(row, idx, ['繝医・繧ｿ繝ｫMQ', '邱舟Q', 'MQ', '蠖捺怦邏崎ｻ凱Q', '蠖捺怦邏熱Q']);
      const totalF = firstNumber_(row, idx, ['繝医・繧ｿ繝ｫF', 'F蜷郁ｨ・, 'F']);
      const existingG = firstNumberOrNull_(row, idx, ['G', '蝟ｶ讌ｭ蛻ｩ逶・, '蛻ｩ逶・]);
      const g = existingG === null ? totalMq - totalF : existingG;
      const purchaseQ = firstNumber_(row, idx, ['雋ｷ蜿鵬', '雋ｷ蜿門床謨ｰ螳溽ｸｾ']);
      const assessmentQ = firstNumber_(row, idx, ['譟ｻ螳啣', '譟ｻ螳壼床謨ｰ螳溽ｸｾ']);
      const aaQ = firstNumber_(row, idx, ['AAQ', 'AA蜿ｰ謨ｰ', '蠖捺怦AA蜃ｺ蜩＿']);
      const salesQ = firstNumber_(row, idx, ['雋ｩ螢ｲQ', '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ', '蠖捺怦莉伜ｸｯQ']);

      return SALES_DEPT_DASH_DB_HEADERS.map(label => {
        switch (label) {
          case '蟇ｾ雎｡譛・: return month;
          case '譖ｴ譁ｰ譌･譎・: return now;
          case '蝟ｶ讌ｭ驛ｨ蜷・: return dept;
          case '莉頑怦譌･謨ｰ': return days.monthDays;
          case '邨碁℃譌･謨ｰ': return days.elapsedDays;
          case '譌･謨ｰ騾ｲ謐・: return formatRate_(days.elapsedDays, days.monthDays);
          case '繧ｹ繧ｿ繝・ヵ謨ｰ': return counts.total || firstNumber_(row, idx, ['繧ｹ繧ｿ繝・ヵ謨ｰ', '莠ｺ謨ｰ']);
          case '雋ｬ莉ｻ閠・ｺｺ謨ｰ': return counts.manager || '';
          case '雋ｷ蜿門霧讌ｭ莠ｺ謨ｰ': return counts.purchase || '';
          case '雋ｩ螢ｲ蝟ｶ讌ｭ莠ｺ謨ｰ': return counts.sales || '';
          case '莠句漁莠ｺ謨ｰ': return counts.office || '';
          case '縺昴・莉紋ｺｺ謨ｰ': return counts.other || '';
          case '繝医・繧ｿ繝ｫMQ': return totalMq;
          case '繝医・繧ｿ繝ｫF': return totalF;
          case 'G': return g;
          case '雋ｷ蜿鵬逶ｮ讓・: return targetNumber_(targets, '雋ｷ蜿鵬逶ｮ讓・);
          case '雋ｷ蜿鵬騾ｲ謐・: return formatRate_(purchaseQ, targetNumber_(targets, '雋ｷ蜿鵬逶ｮ讓・));
          case '譟ｻ螳啣逶ｮ讓・: return targetNumber_(targets, '譟ｻ螳啣逶ｮ讓・);
          case '譟ｻ螳啣騾ｲ謐・: return formatRate_(assessmentQ, targetNumber_(targets, '譟ｻ螳啣逶ｮ讓・));
          case 'AAQ逶ｮ讓・: return targetNumber_(targets, 'AAQ逶ｮ讓・);
          case 'AAQ騾ｲ謐・: return formatRate_(aaQ, targetNumber_(targets, 'AAQ逶ｮ讓・));
          case '雋ｩ螢ｲQ逶ｮ讓・: return targetNumber_(targets, '雋ｩ螢ｲQ逶ｮ讓・);
          case '雋ｩ螢ｲQ騾ｲ謐・: return formatRate_(salesQ, targetNumber_(targets, '雋ｩ螢ｲQ逶ｮ讓・));
          case '雋ｷ蜿匁ュ蝣ｱ謨ｰ逶ｮ讓・: return targetNumber_(targets, '雋ｷ蜿匁ュ蝣ｱ謨ｰ逶ｮ讓・);
          case '雋ｷ蜿匁ュ蝣ｱ謨ｰ騾ｲ謐・: return formatRate_(firstNumber_(row, idx, ['雋ｷ蜿匁ュ蝣ｱ謨ｰ', '諠・ｱ謨ｰ']), targetNumber_(targets, '雋ｷ蜿匁ュ蝣ｱ謨ｰ逶ｮ讓・));
          case 'MQ逶ｮ讓・: return targetNumber_(targets, 'MQ逶ｮ讓・);
          case 'MQ騾ｲ謐・: return formatRate_(totalMq, targetNumber_(targets, 'MQ逶ｮ讓・));
          case 'F逶ｮ讓・: return targetNumber_(targets, 'F逶ｮ讓・);
          case 'F騾ｲ謐・: return formatRate_(totalF, targetNumber_(targets, 'F逶ｮ讓・));
          case 'G逶ｮ讓・: return targetNumber_(targets, 'G逶ｮ讓・);
          case 'G騾ｲ謐・: return formatRate_(g, targetNumber_(targets, 'G逶ｮ讓・));
          case '莠育ｴ・焚逶ｮ讓・: return targetNumber_(targets, '莠育ｴ・焚逶ｮ讓・);
          case '莠育ｴ・焚騾ｲ謐・: return formatRate_(firstNumber_(row, idx, ['莠育ｴ・焚', '邱丈ｺ育ｴ・]), targetNumber_(targets, '莠育ｴ・焚逶ｮ讓・));
          case '螂醍ｴ・焚逶ｮ讓・: return targetNumber_(targets, '螂醍ｴ・焚逶ｮ讓・);
          case '螂醍ｴ・焚騾ｲ謐・: return formatRate_(firstNumber_(row, idx, ['螂醍ｴ・焚', '邱丞･醍ｴ・]), targetNumber_(targets, '螂醍ｴ・焚逶ｮ讓・));
          case '豎ｺ陬∵焚逶ｮ讓・: return targetNumber_(targets, '豎ｺ陬∵焚逶ｮ讓・);
          case '豎ｺ陬∵焚騾ｲ謐・: return formatRate_(firstNumber_(row, idx, ['豎ｺ陬∵焚']), targetNumber_(targets, '豎ｺ陬∵焚逶ｮ讓・));
          default: return resolveSalesDeptDashValue_(label, row, idx);
        }
      });
    });

  writeSalesDeptRows_(target, SALES_DEPT_DASH_DB_HEADERS, rows);
  return { ok: true, rows: rows.length };
}

function buildSalesDeptDailyDb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const target = ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashDaily, SALES_DEPT_DAILY_HEADERS);
  const source = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceDaily);
  const month = getSalesDeptTargetMonth_();

  if (!source) {
    writeSalesDeptRows_(target, SALES_DEPT_DAILY_HEADERS, []);
    return { ok: true, rows: 0, note: '譌･蛻･髮・ｨ医す繝ｼ繝医′縺ｪ縺・◆繧∫ｩｺ縺ｧ菴懈・縺励∪縺励◆縲・ };
  }

  const values = source.getDataRange().getDisplayValues();
  if (values.length < 2) return { ok: true, rows: 0 };

  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  const rows = values.slice(1)
    .filter(row => row.some(Boolean))
    .map(row => {
      const date = getByHeader_(row, idx, ['譌･莉・, '譌･']);
      const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・, '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']);
      if (!dept || !date) return null;
      return [
        month,
        dept,
        date,
        getWeekday_(date),
        firstNumber_(row, idx, ['譟ｻ螳壻ｻｶ謨ｰ', '譟ｻ螳啣', '譟ｻ螳壽焚']),
        firstNumber_(row, idx, ['雋ｷ蜿紋ｻｶ謨ｰ', '雋ｷ蜿鵬', '螂醍ｴ・焚']),
        firstNumber_(row, idx, ['雋ｩ螢ｲ莉ｶ謨ｰ', '雋ｩ螢ｲQ']),
        firstNumber_(row, idx, ['螂醍ｴ・ｻｶ謨ｰ', '螂醍ｴ・焚']),
        getByHeader_(row, idx, ['雋ｷ蜿匁・邏ГVR', '謌千ｴ・紫']),
        getByHeader_(row, idx, ['譟ｻ螳咾VR']),
        firstNumber_(row, idx, ['MQ', '邱舟Q']),
        firstNumber_(row, idx, ['F', 'F蜷郁ｨ・]),
        firstNumber_(row, idx, ['G'])
      ];
    })
    .filter(Boolean);

  writeSalesDeptRows_(target, SALES_DEPT_DAILY_HEADERS, rows);
  return { ok: true, rows: rows.length };
}

function buildSalesDeptPersonalDb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourcePersonal);
  const target = ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashPersonal, SALES_DEPT_PERSONAL_HEADERS);
  if (!source) {
    writeSalesDeptRows_(target, SALES_DEPT_PERSONAL_HEADERS, []);
    return { ok: true, rows: 0, note: '蛟倶ｺｺ蛻･髮・ｨ医す繝ｼ繝医′縺ｪ縺・◆繧∫ｩｺ縺ｧ菴懈・縺励∪縺励◆縲・ };
  }

  const values = source.getDataRange().getDisplayValues();
  if (values.length < 2) return { ok: true, rows: 0 };

  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  const month = getSalesDeptTargetMonth_();
  const employeeMap = getEmployeeMap_();
  const targetMap = getTargetMap_();

  const rows = values.slice(1)
    .filter(row => getByHeader_(row, idx, ['豌丞錐', '蜷榊燕']) || row[0])
    .map(row => {
      const name = getByHeader_(row, idx, ['豌丞錐', '蜷榊燕']) || row[0];
      const employee = employeeMap[name] || {};
      const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ', '謇螻槫霧讌ｭ驛ｨ', '驛ｨ髢']) || employee.department || '';
      const store = getByHeader_(row, idx, ['諡轤ｹ蜷・, '蠎苓・', '謇螻・]) || employee.store || '';
      const role = getByHeader_(row, idx, ['蠖ｹ閨ｷ']) || employee.role || '';
      const rank = getByHeader_(row, idx, ['繝ｩ繝ｳ繧ｯ']) || employee.rank || '';
      const targets = targetMap[makeTargetKey_(month, '蛟倶ｺｺ', dept, store, name)] || {};
      const assessment = firstNumber_(row, idx, ['譟ｻ螳啣', '譟ｻ螳壽焚']);
      const purchase = firstNumber_(row, idx, ['雋ｷ蜿鵬', '雋ｷ蜿匁焚']);
      const mq = firstNumber_(row, idx, ['MQ', '蠖捺怦邏崎ｻ凱Q', '雋ｩ螢ｲMQ']);
      const targetAssessment = targetNumber_(targets, '譟ｻ螳啣逶ｮ讓・) || targetNumber_(targets, '逶ｮ讓呎渊螳壽焚');
      const targetPurchase = targetNumber_(targets, '雋ｷ蜿鵬逶ｮ讓・) || targetNumber_(targets, '逶ｮ讓呵ｲｷ蜿匁焚');
      const targetMq = targetNumber_(targets, 'MQ逶ｮ讓・);

      return [
        month,
        dept,
        store,
        name,
        role,
        rank,
        assessment,
        purchase,
        getByHeader_(row, idx, ['謌千ｴ・紫', '邱乗・邏・紫']),
        mq,
        firstNumber_(row, idx, ['莠育ｴ・焚', '邱丈ｺ育ｴ・]),
        firstNumber_(row, idx, ['莠育ｴ・･醍ｴ・焚', '邱丞･醍ｴ・]),
        firstNumber_(row, idx, ['豎ｺ陬∵焚']),
        targetAssessment,
        targetPurchase,
        targetNumber_(targets, '螂醍ｴ・焚逶ｮ讓・) || targetNumber_(targets, '逶ｮ讓吝･醍ｴ・焚'),
        targetNumber_(targets, '莠育ｴ・焚逶ｮ讓・) || targetNumber_(targets, '逶ｮ讓吩ｺ育ｴ・焚'),
        targetNumber_(targets, '豎ｺ陬∵焚逶ｮ讓・) || targetNumber_(targets, '逶ｮ讓呎ｱｺ陬∵焚'),
        formatRate_(assessment, targetAssessment),
        formatRate_(purchase, targetPurchase),
        formatRate_(mq, targetMq),
        assessment - targetAssessment,
        mq - targetMq
      ];
    });

  writeSalesDeptRows_(target, SALES_DEPT_PERSONAL_HEADERS, rows);
  return { ok: true, rows: rows.length };
}

function getSalesDeptOptions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.dashDb);
  if (!sheet || sheet.getLastRow() < 2) return ['譛ｬ驛ｨ', '繧ｵ繝ｼ繝薙せ'];
  const values = sheet.getDataRange().getDisplayValues();
  const header = values[0] || [];
  const idx = makeSalesDeptHeaderIndex_(header);
  const raw = values.slice(1)
    .map(row => getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・, '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']))
    .filter(Boolean);
  const unique = [];
  ['譛ｬ驛ｨ', '繧ｵ繝ｼ繝薙せ'].concat(raw).forEach(name => {
    if (name && unique.indexOf(name) === -1) unique.push(name);
  });
  return unique;
}

function getSalesDeptDashboard(deptName) {
  const cacheKey = `salesDeptDash:${deptName || ''}`;
  return getCachedSalesDept_(cacheKey, () => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.dashDb);
    if (!sheet) throw new Error('蝟ｶ讌ｭ驛ｨDASH_DB縺後≠繧翫∪縺帙ｓ縲ＤreateSalesDeptDashboardSheets()繧貞ｮ溯｡後＠縺ｦ縺上□縺輔＞縲・);
    const values = sheet.getDataRange().getDisplayValues();
    if (values.length < 2) return { options: [], selectedDept: '', summary: {}, targets: {}, kpis: [] };
    const header = values[0];
    const idx = makeSalesDeptHeaderIndex_(header);
    const sourceRows = values.slice(1);
    const rowObjects = sourceRows.map(row => rowToObject_(header, row));
    const options = getSalesDeptOptions();
    const selected = deptName && options.includes(deptName) ? deptName : options[0];
    let obj;

    if (isHeadquartersDept_(selected)) {
      obj = buildHeadquartersSalesDeptSummary_(header, rowObjects);
    } else {
      const row = sourceRows.find(item => getByHeader_(item, idx, ['蝟ｶ讌ｭ驛ｨ蜷・]) === selected) || sourceRows[0];
      obj = rowToObject_(header, row);
      if (isServiceDept_(selected)) obj['陦ｨ遉ｺ蛹ｺ蛻・] = '繧ｵ繝ｼ繝薙せ';
    }

    return {
      options,
      selectedDept: selected,
      summary: obj,
      kpis: buildDashboardKpiCards_(obj),
      staff: pickObject_(obj, ['繧ｹ繧ｿ繝・ヵ謨ｰ', '雋ｬ莉ｻ閠・ｺｺ謨ｰ', '雋ｷ蜿門霧讌ｭ莠ｺ謨ｰ', '雋ｩ螢ｲ蝟ｶ讌ｭ莠ｺ謨ｰ', '莠句漁莠ｺ謨ｰ', '縺昴・莉紋ｺｺ謨ｰ']),
      revenue: pickObject_(obj, ['AAMQ', '雋ｩ螢ｲMQ', '莉伜ｸｯMQ', 'KBMQ', '繧ｹ繧ｯ繝ｩ繝・・MQ', '繧ｯ繝ｬ繧ｸ繝・ヨMQ']),
      expense: pickObject_(obj, ['蝗ｺ螳夊ｲｻ', '莠ｺ莉ｶ雋ｻ', '螂ｨ蜉ｱ驥・, '諠・ｱ譁・, '謗ｲ霈画侭', 'CC驕句霧雋ｻ', '雋ｩ邂｡雋ｻ']),
      purchase: pickObject_(obj, ['雋ｷ蜿匁ュ蝣ｱ謨ｰ', '髢狗､ｺ謨ｰ', '譟ｻ螳壼床謨ｰ螳溽ｸｾ', '雋ｷ蜿門床謨ｰ螳溽ｸｾ', '譟ｻ螳咾VR', '雋ｷ蜿匁・邏ГVR', '雋ｷ蜿匁ュ蝣ｱ謌千ｴ・紫', 'AA蜃ｦ逅・', 'AA譛ｪ蜃ｦ逅・', 'AA邏熱Q', 'AA@']),
      purchaseTypes: pickObject_(obj, ['AA蜿ｰ謨ｰ', '螻慕､ｺ蜿ｰ謨ｰ', '繧ｹ繧ｯ繝ｩ繝・・蜿ｰ謨ｰ', '莉｣霆雁床謨ｰ', '蝟ｶ讌ｭ霆雁床謨ｰ', '縺昴・莉門床謨ｰ']),
      aaBid: pickObject_(obj, ['關ｽ譛ｭ蜿ｰ謨ｰ', '豬∵惆蜿ｰ謨ｰ', '蜿匁ｶ亥床謨ｰ', '鄙梧怦蜿ｰ謨ｰ', '關ｽ譛ｭ邇・, '豬∵惆邇・, '蜿匁ｶ育紫']),
      sales: pickObject_(obj, ['螢ｲ荳・, '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ', '蜿玲ｳｨQ', '邏崎ｻ雁床謨ｰ螳溽ｸｾ', '邏崎ｻ頑ｸ・Q', '譛ｪ邏崎ｻ凱Q', '雋ｩ螢ｲ邏熱Q', '莉伜ｸｯMQ', 'KBMQ']),
      attachments: pickObject_(obj, ['繧ｯ繝ｬ繧ｸ繝・ヨ莉ｶ謨ｰ', '繧ｯ繝ｬ繧ｸ繝・ヨ豈皮紫', '菫晁ｨｼ莉ｶ謨ｰ', '菫晁ｨｼ豈皮紫', '繝｡繝ｳ繝・リ繝ｳ繧ｹ莉ｶ謨ｰ', '繝｡繝ｳ繝・リ繝ｳ繧ｹ豈皮紫', '繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ莉ｶ謨ｰ', '繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ豈皮紫', '繧ｨ繧｢繧ｳ繝ｳ莉ｶ謨ｰ', '繧ｨ繧｢繧ｳ繝ｳ豈皮紫', '讌ｽ縲・ｴ崎ｻ贋ｻｶ謨ｰ', '讌ｽ縲・ｴ崎ｻ頑ｯ皮紫', '繧ｿ繧､繝､莠､謠帑ｻｶ謨ｰ', '繧ｿ繧､繝､莠､謠帶ｯ皮紫']),
      progress: buildProgressRows_(obj)
    };
  });
}

function getSalesDeptDaily(deptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.dashDaily);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  const rows = values.slice(1)
    .filter(row => {
      const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・]);
      return isHeadquartersDept_(deptName) ? isSalesDeptAggregateTarget_(dept) : dept === deptName;
    })
    .map(row => rowToObject_(header, row));

  if (isHeadquartersDept_(deptName)) return aggregateDailyRowsForHeadquarters_(rows);
  return rows;
}

function getSalesDeptMembers(deptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.dashPersonal);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  return values.slice(1)
    .filter(row => {
      const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・]);
      return isHeadquartersDept_(deptName) ? isSalesDeptAggregateTarget_(dept) : dept === deptName;
    })
    .map(row => rowToObject_(header, row));
}

function getSalesEmployeeDirectory(deptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceEmployee);
  if (!sheet || sheet.getLastRow() < 2) return getSalesDeptMembers(deptName);

  const values = sheet.getDataRange().getDisplayValues();
  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  const storeDeptMap = getStoreDepartmentMap_();

  return values.slice(1)
    .filter(row => row.some(Boolean))
    .map(row => {
      const name = getByHeader_(row, idx, ['豌丞錐', '蜷榊燕']);
      const store = getByHeader_(row, idx, ['謇螻・, '蠎苓・', '諡轤ｹ', '諡轤ｹ蜷・]);
      const rawDept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ', '謇螻槫霧讌ｭ驛ｨ', '驛ｨ髢']);
      const dept = rawDept || storeDeptMap[store] || store;
      return {
        '豌丞錐': name,
        '蝟ｶ讌ｭ驛ｨ蜷・: dept,
        '諡轤ｹ蜷・: store,
        '謇螻・: store,
        '蠖ｹ閨ｷ': getByHeader_(row, idx, ['蠖ｹ閨ｷ', '閨ｷ遞ｮ']),
        '繝ｩ繝ｳ繧ｯ': getByHeader_(row, idx, ['繝ｩ繝ｳ繧ｯ']),
        '豎ｺ陬∬・: getByHeader_(row, idx, ['豎ｺ陬∬・]),
        '蜈･遉ｾ譌･': getByHeader_(row, idx, ['蜈･遉ｾ譌･']),
        '遉ｾ豁ｴ': getByHeader_(row, idx, ['遉ｾ豁ｴ']),
        '蝗ｺ螳夂ｵｦ': getByHeader_(row, idx, ['蝗ｺ螳夂ｵｦ']),
        '邨瑚ｲｻ': getByHeader_(row, idx, ['邨瑚ｲｻ'])
      };
    })
    .filter(row => {
      const dept = row['蝟ｶ讌ｭ驛ｨ蜷・];
      if (isHeadquartersDept_(deptName)) return isSalesDeptAggregateTarget_(dept) || isHeadquartersDept_(dept);
      if (isServiceDept_(deptName)) return isServiceDept_(dept);
      return deptName ? dept === deptName : true;
    });
}

function getSalesAuthorityMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('讓ｩ髯舌・繧ｹ繧ｿ');
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const header = values[0];
  return values.slice(1)
    .filter(row => row.some(Boolean))
    .map(row => rowToObject_(header, row));
}

function getSalesDeptStores(deptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceStore);

  if (sheet && sheet.getLastRow() >= 2) {
    const values = sheet.getDataRange().getDisplayValues();
    const header = values[0];
    const idx = makeSalesDeptHeaderIndex_(header);
    const rows = values.slice(1)
      .filter(row => {
        const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・, '謇螻槫霧讌ｭ驛ｨ', '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']);
        if (isHeadquartersDept_(deptName)) return isSalesDeptAggregateTarget_(dept);
        return deptName ? dept === deptName : true;
      })
      .map(row => {
        const storeName = getByHeader_(row, idx, ['蠎苓・蜷・, '諡轤ｹ蜷・, '蠎苓・']);
        return {
          '蠎苓・蜷・: storeName,
          '蝟ｶ讌ｭ驛ｨ蜷・: getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・, '謇螻槫霧讌ｭ驛ｨ', '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']),
          '繧ｹ繧ｿ繝・ヵ謨ｰ': getByHeader_(row, idx, ['繧ｹ繧ｿ繝・ヵ謨ｰ', '莠ｺ謨ｰ']),
          '螢ｲ荳・: getByHeader_(row, idx, ['螢ｲ荳・, '螢ｲ荳雁粋險・, '雋ｩ螢ｲ螢ｲ荳・, '雋ｩ螢ｲ萓｡譬ｼ蜷郁ｨ・, '雋ｩ螢ｲ邱城｡・, '雋ｩ螢ｲ萓｡譬ｼ']),
          'MQ': getByHeader_(row, idx, ['MQ', '繝医・繧ｿ繝ｫMQ', '邱舟Q', '蠖捺怦邏崎ｻ凱Q']),
          'F': getByHeader_(row, idx, ['F', 'F蜷郁ｨ・]),
          'G': getByHeader_(row, idx, ['G', '蝟ｶ讌ｭ蛻ｩ逶・, '蛻ｩ逶・]),
          '雋ｷ蜿鵬': getByHeader_(row, idx, ['雋ｷ蜿鵬', '雋ｷ蜿門床謨ｰ螳溽ｸｾ']),
          '雋ｩ螢ｲQ': getByHeader_(row, idx, ['雋ｩ螢ｲQ', '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ']),
          '譟ｻ螳啣': getByHeader_(row, idx, ['譟ｻ螳啣', '譟ｻ螳壼床謨ｰ螳溽ｸｾ']),
          '謌千ｴ・紫': getByHeader_(row, idx, ['謌千ｴ・紫', '謌千ｴГVR', '雋ｷ蜿匁・邏ГVR']),
          'AA蜑ｲ蜷・: getByHeader_(row, idx, ['AA蜑ｲ蜷・, 'AA豈皮紫']),
          '螻慕､ｺ蜑ｲ蜷・: getByHeader_(row, idx, ['螻慕､ｺ蜑ｲ蜷・, '蝠・刀豈皮紫']),
          '蝗ｺ螳夊ｲｻ': getByHeader_(row, idx, ['蝗ｺ螳夊ｲｻ', '蝗ｺ螳夊ｲｻ蜷郁ｨ・]),
          '莠ｺ莉ｶ雋ｻ': getByHeader_(row, idx, ['莠ｺ莉ｶ雋ｻ', '莠ｺ莉ｶ雋ｻ蜷郁ｨ・]),
          '蠎・相雋ｻ': getByHeader_(row, idx, ['蠎・相雋ｻ', '蠎・相雋ｻ蜷郁ｨ・])
        };
      })
      .filter(row => row['蠎苓・蜷・]);

    if (rows.length > 0) return rows;
  }

  return buildStoresFromMembers_(deptName);
}

function getTargetSettings(deptName) {
  const targetMap = getTargetMap_();
  const month = getSalesDeptTargetMonth_();
  return targetMap[makeTargetKey_(month, '蝟ｶ讌ｭ驛ｨ', deptName, '', '')] || {};
}

function createSalesDeptDashboardRefreshTrigger() {
  ScriptApp.newTrigger('buildSalesDeptDashboardAllDbs')
    .timeBased()
    .everyHours(1)
    .create();
}

function ensureSalesDeptSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getDisplayValues()[0];
    const mismatch = headers.some((h, i) => current[i] !== h);
    if (mismatch) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.setFrozenRows(1);
  return sheet;
}

function writeSalesDeptRows_(sheet, headers, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function resolveSalesDeptDashValue_(label, row, idx) {
  const candidates = {
    '螢ｲ荳・: ['螢ｲ荳・, '螢ｲ荳雁粋險・, '雋ｩ螢ｲ螢ｲ荳・, '雋ｩ螢ｲ萓｡譬ｼ蜷郁ｨ・, '雋ｩ螢ｲ邱城｡・, '雋ｩ螢ｲ萓｡譬ｼ'],
    '蟷ｳ蝮①': ['蟷ｳ蝮①', '@'],
    '謌千ｴ・紫': ['謌千ｴ・紫', '邱乗・邏・紫', '謌千ｴГVR'],
    'AA蜑ｲ蜷・: ['AA蜑ｲ蜷・, 'AA豈皮紫'],
    '螻慕､ｺ蜑ｲ蜷・: ['螻慕､ｺ蜑ｲ蜷・, '蝠・刀豈皮紫'],
    'AAMQ': ['AAMQ', '蠖捺怦AAMQ', 'AA邊怜茜'],
    'AA邏熱Q': ['AA邏熱Q', 'AA蜃ｦ逅・ｸ・Q'],
    '雋ｩ螢ｲMQ': ['雋ｩ螢ｲMQ', '雋ｩ螢ｲ邊怜茜'],
    '雋ｩ螢ｲ邏熱Q': ['雋ｩ螢ｲ邏熱Q'],
    '邏崎ｻ頑ｸ・Q': ['邏崎ｻ頑ｸ・Q', '蠖捺怦邏崎ｻ凱Q'],
    '譛ｪ邏崎ｻ凱Q': ['譛ｪ邏崎ｻ凱Q', '蠖捺怦譛ｪ邏崎ｻ凱Q'],
    '莉伜ｸｯMQ': ['莉伜ｸｯMQ', '蠖捺怦莉伜ｸｯMQ'],
    '莉伜ｸｯ邱舟Q': ['莉伜ｸｯ邱舟Q'],
    'KBMQ': ['KBMQ', 'KB邏熱Q'],
    '繧ｹ繧ｯ繝ｩ繝・・MQ': ['繧ｹ繧ｯ繝ｩ繝・・MQ', '繧ｹ繧ｯ繝ｩ繝・・邊怜茜'],
    '繧ｯ繝ｬ繧ｸ繝・ヨMQ': ['繧ｯ繝ｬ繧ｸ繝・ヨMQ'],
    '蝗ｺ螳夊ｲｻ': ['蝗ｺ螳夊ｲｻ'],
    '螂醍ｴ・≡': ['螂醍ｴ・≡'],
    '莠ｺ莉ｶ雋ｻ': ['莠ｺ莉ｶ雋ｻ'],
    '螂ｨ蜉ｱ驥・: ['螂ｨ蜉ｱ驥・, '螂ｨ蜉ｱ驥大粋險・, '繧､繝ｳ繧ｻ繝ｳ繝・ぅ繝・, '・ｲ・晢ｽｾ・晢ｾ・ｽｨ・鯉ｾ槫粋險・],
    '諠・ｱ譁・: ['諠・ｱ譁・],
    '謗ｲ霈画侭': ['謗ｲ霈画侭', '謗ｲ霈画侭蜷郁ｨ・],
    'CC驕句霧雋ｻ': ['CC驕句霧雋ｻ', '・｣・｣驕句霧雋ｻ', 'CC驕句霧雋ｻ蜷郁ｨ・, '・｣・｣驕句霧雋ｻ蜷郁ｨ・],
    '雋ｩ邂｡雋ｻ': ['雋ｩ邂｡雋ｻ', '雋ｩ邂｡雋ｻ蜷郁ｨ・, '邂｡逅・ｲｻ'],
    '蠎・相雋ｻ': ['蠎・相雋ｻ'],
    '縺昴・莉也ｵ瑚ｲｻ': ['縺昴・莉也ｵ瑚ｲｻ', '髮題ｲｻ', '雋ｩ邂｡雋ｻ'],
    '雋ｷ蜿匁ュ蝣ｱ謨ｰ': ['雋ｷ蜿匁ュ蝣ｱ謨ｰ', '諠・ｱ謨ｰ'],
    '髢狗､ｺ謨ｰ': ['髢狗､ｺ謨ｰ'],
    '譟ｻ螳壼床謨ｰ螳溽ｸｾ': ['譟ｻ螳壼床謨ｰ螳溽ｸｾ', '譟ｻ螳啣'],
    '雋ｷ蜿門床謨ｰ螳溽ｸｾ': ['雋ｷ蜿門床謨ｰ螳溽ｸｾ', '雋ｷ蜿鵬'],
    '譟ｻ螳咾VR': ['譟ｻ螳咾VR'],
    '雋ｷ蜿匁・邏ГVR': ['雋ｷ蜿匁・邏ГVR', '謌千ｴ・紫'],
    '雋ｷ蜿匁ュ蝣ｱ謌千ｴ・紫': ['雋ｷ蜿匁ュ蝣ｱ謌千ｴ・紫', '諠・ｱ謌千ｴ・紫'],
    'AA蜃ｦ逅・': ['AA蜃ｦ逅・', 'AA蜃ｦ逅・ｸ・'],
    'AA譛ｪ蜃ｦ逅・': ['AA譛ｪ蜃ｦ逅・'],
    'AAMQ': ['AAMQ', '蠖捺怦AAMQ'],
    'AA蟷ｳ蝮・ｲ怜茜': ['AA蟷ｳ蝮・ｲ怜茜', 'AA@'],
    'AA@': ['AA@', 'AA蟷ｳ蝮・ｲ怜茜'],
    'AA蜿ｰ謨ｰ': ['AA蜿ｰ謨ｰ', 'AAQ'],
    '螻慕､ｺ蜿ｰ謨ｰ': ['螻慕､ｺ蜿ｰ謨ｰ', '蝠・刀Q'],
    '繧ｹ繧ｯ繝ｩ繝・・蜿ｰ謨ｰ': ['繧ｹ繧ｯ繝ｩ繝・・蜿ｰ謨ｰ', '繧ｹ繧ｯ繝ｩ繝・・Q'],
    '莉｣霆雁床謨ｰ': ['莉｣霆雁床謨ｰ', '莉｣霆害'],
    '蝟ｶ讌ｭ霆雁床謨ｰ': ['蝟ｶ讌ｭ霆雁床謨ｰ'],
    '關ｽ譛ｭ蜿ｰ謨ｰ': ['關ｽ譛ｭ蜿ｰ謨ｰ', 'AA關ｽ譛ｭQ'],
    '豬∵惆蜿ｰ謨ｰ': ['豬∵惆蜿ｰ謨ｰ'],
    '蜿匁ｶ亥床謨ｰ': ['蜿匁ｶ亥床謨ｰ'],
    '鄙梧怦蜿ｰ謨ｰ': ['鄙梧怦蜿ｰ謨ｰ', '鄙梧怦Q'],
    '關ｽ譛ｭ邇・: ['關ｽ譛ｭ邇・],
    '豬∵惆邇・: ['豬∵惆邇・],
    '蜿匁ｶ育紫': ['蜿匁ｶ育紫'],
    '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ': ['雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ', '雋ｩ螢ｲQ'],
    '蜿玲ｳｨQ': ['蜿玲ｳｨQ', '蠖捺怦蜿玲ｳｨQ'],
    '邏崎ｻ雁床謨ｰ螳溽ｸｾ': ['邏崎ｻ雁床謨ｰ螳溽ｸｾ', '邏崎ｻ害', '蠖捺怦邏崎ｻ害'],
    '繧ｯ繝ｬ繧ｸ繝・ヨ莉ｶ謨ｰ': ['繧ｯ繝ｬ繧ｸ繝・ヨ莉ｶ謨ｰ', '繧ｯ繝ｬ繧ｸ繝・ヨQ'],
    '繧ｯ繝ｬ繧ｸ繝・ヨ豈皮紫': ['繧ｯ繝ｬ繧ｸ繝・ヨ豈皮紫'],
    '菫晁ｨｼ莉ｶ謨ｰ': ['菫晁ｨｼ莉ｶ謨ｰ', '菫晁ｨｼQ'],
    '菫晁ｨｼ豈皮紫': ['菫晁ｨｼ豈皮紫'],
    '繝｡繝ｳ繝・リ繝ｳ繧ｹ莉ｶ謨ｰ': ['繝｡繝ｳ繝・リ繝ｳ繧ｹ莉ｶ謨ｰ', '繝｡繝ｳ繝・'],
    '繝｡繝ｳ繝・リ繝ｳ繧ｹ豈皮紫': ['繝｡繝ｳ繝・リ繝ｳ繧ｹ豈皮紫'],
    '繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ莉ｶ謨ｰ': ['繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ莉ｶ謨ｰ'],
    '繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ豈皮紫': ['繧ｯ繝ｪ繝ｼ繝九Φ繧ｰ豈皮紫'],
    '繧ｨ繧｢繧ｳ繝ｳ莉ｶ謨ｰ': ['繧ｨ繧｢繧ｳ繝ｳ莉ｶ謨ｰ'],
    '繧ｨ繧｢繧ｳ繝ｳ豈皮紫': ['繧ｨ繧｢繧ｳ繝ｳ豈皮紫'],
    '讌ｽ縲・ｴ崎ｻ贋ｻｶ謨ｰ': ['讌ｽ縲・ｴ崎ｻ贋ｻｶ謨ｰ'],
    '讌ｽ縲・ｴ崎ｻ頑ｯ皮紫': ['讌ｽ縲・ｴ崎ｻ頑ｯ皮紫'],
    '繧ｿ繧､繝､莠､謠帑ｻｶ謨ｰ': ['繧ｿ繧､繝､莠､謠帑ｻｶ謨ｰ'],
    '繧ｿ繧､繝､莠､謠帶ｯ皮紫': ['繧ｿ繧､繝､莠､謠帶ｯ皮紫']
  };
  return getByHeader_(row, idx, candidates[label] || [label]);
}

function getSalesDeptStaffCounts_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceEmployee);
  const out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  const values = sheet.getDataRange().getDisplayValues();
  const idx = makeSalesDeptHeaderIndex_(values[0]);
  values.slice(1).forEach(row => {
    const dept = getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ', '驛ｨ髢', '謇螻・]);
    if (!dept) return;
    const role = getByHeader_(row, idx, ['蠖ｹ閨ｷ', '閨ｷ遞ｮ']);
    if (!out[dept]) out[dept] = { total: 0, manager: 0, purchase: 0, sales: 0, office: 0, other: 0 };
    out[dept].total++;
    const bucket = classifyRole_(role);
    out[dept][bucket]++;
  });
  return out;
}

function classifyRole_(role) {
  const text = String(role || '');
  if (/蝟ｶ讌ｭ驛ｨ髟ｷ|驛ｨ髟ｷ|蠎鈴聞|MG|雋ｬ莉ｻ閠・隱ｲ髟ｷ/.test(text)) return 'manager';
  if (/雋ｷ蜿・.test(text)) return 'purchase';
  if (/雋ｩ螢ｲ/.test(text)) return 'sales';
  if (/莠句漁|譖ｸ鬘桍邱丞漁|邂｡逅・.test(text)) return 'office';
  return 'other';
}

function getEmployeeMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceEmployee);
  const out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  const values = sheet.getDataRange().getDisplayValues();
  const idx = makeSalesDeptHeaderIndex_(values[0]);
  values.slice(1).forEach(row => {
    const name = getByHeader_(row, idx, ['豌丞錐', '蜷榊燕']);
    if (!name) return;
    out[name] = {
      department: getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ', '驛ｨ髢', '謇螻・]),
      store: getByHeader_(row, idx, ['蠎苓・', '諡轤ｹ', '謇螻・]),
      role: getByHeader_(row, idx, ['蠖ｹ閨ｷ']),
      rank: getByHeader_(row, idx, ['繝ｩ繝ｳ繧ｯ'])
    };
  });
  return out;
}

function getStoreDepartmentMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALES_DEPT_DASH.sheets.sourceStore);
  const out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  const values = sheet.getDataRange().getDisplayValues();
  const idx = makeSalesDeptHeaderIndex_(values[0]);
  values.slice(1).forEach(row => {
    const store = getByHeader_(row, idx, ['蠎苓・蜷・, '諡轤ｹ蜷・, '蠎苓・']);
    const dept = getByHeader_(row, idx, ['謇螻槫霧讌ｭ驛ｨ', '蝟ｶ讌ｭ驛ｨ蜷・, '蝟ｶ讌ｭ驛ｨ', '驛ｨ髢']);
    if (store && dept) out[store] = dept;
  });
  return out;
}

function getTargetMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSalesDeptSheet_(ss, SALES_DEPT_DASH.sheets.dashTarget, SALES_DEPT_TARGET_HEADERS);
  if (sheet.getLastRow() < 2) return {};
  const values = sheet.getDataRange().getDisplayValues();
  const header = values[0];
  const idx = makeSalesDeptHeaderIndex_(header);
  const out = {};
  values.slice(1).forEach(row => {
    const key = makeTargetKey_(
      getByHeader_(row, idx, ['蟇ｾ雎｡譛・]),
      getByHeader_(row, idx, ['遞ｮ蛻･']),
      getByHeader_(row, idx, ['蝟ｶ讌ｭ驛ｨ蜷・]),
      getByHeader_(row, idx, ['諡轤ｹ蜷・]),
      getByHeader_(row, idx, ['豌丞錐'])
    );
    const obj = rowToObject_(header, row);
    out[key] = obj;
  });
  return out;
}

function makeTargetKey_(month, type, dept, store, name) {
  return [month || '', type || '', dept || '', store || '', name || ''].join('||');
}

function targetNumber_(targets, key) {
  return parseNumber_(targets && targets[key]);
}

function buildDashboardKpiCards_(obj) {
  return [
    ['螢ｲ荳・, '螢ｲ荳・, 'money'],
    ['繝医・繧ｿ繝ｫMQ', '繝医・繧ｿ繝ｫMQ', 'money'],
    ['繝医・繧ｿ繝ｫF', '繝医・繧ｿ繝ｫF', 'money'],
    ['G', 'G', 'money'],
    ['雋ｷ蜿鵬', '雋ｷ蜿門床謨ｰ螳溽ｸｾ', 'q'],
    ['譟ｻ螳啣', '譟ｻ螳壼床謨ｰ螳溽ｸｾ', 'q'],
    ['謌千ｴГVR', '雋ｷ蜿匁・邏ГVR', 'rate'],
    ['譟ｻ螳咾VR', '譟ｻ螳咾VR', 'rate'],
    ['AAMQ', 'AAMQ', 'money'],
    ['AA蜃ｦ逅・', 'AA蜃ｦ逅・', 'q'],
    ['AA@', 'AA@', 'money'],
    ['雋ｩ螢ｲQ', '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ', 'q'],
    ['邏崎ｻ害', '邏崎ｻ雁床謨ｰ螳溽ｸｾ', 'q'],
    ['邏崎ｻ頑ｸ・Q', '邏崎ｻ頑ｸ・Q', 'money'],
    ['譛ｪ邏崎ｻ凱Q', '譛ｪ邏崎ｻ凱Q', 'money']
  ].map(([label, key, type]) => ({ label, value: obj[key] || '0', type }));
}

function buildProgressRows_(obj) {
  const pairs = [
    ['雋ｷ蜿匁ュ蝣ｱ謨ｰ', '雋ｷ蜿匁ュ蝣ｱ謨ｰ逶ｮ讓・, '雋ｷ蜿匁ュ蝣ｱ謨ｰ'],
    ['雋ｷ蜿鵬', '雋ｷ蜿鵬逶ｮ讓・, '雋ｷ蜿門床謨ｰ螳溽ｸｾ'],
    ['譟ｻ螳啣', '譟ｻ螳啣逶ｮ讓・, '譟ｻ螳壼床謨ｰ螳溽ｸｾ'],
    ['AAQ', 'AAQ逶ｮ讓・, 'AA蜿ｰ謨ｰ'],
    ['雋ｩ螢ｲQ', '雋ｩ螢ｲQ逶ｮ讓・, '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ'],
    ['MQ', 'MQ逶ｮ讓・, '繝医・繧ｿ繝ｫMQ'],
    ['F', 'F逶ｮ讓・, '繝医・繧ｿ繝ｫF'],
    ['G', 'G逶ｮ讓・, 'G'],
    ['莠育ｴ・焚', '莠育ｴ・焚逶ｮ讓・, '莠育ｴ・焚'],
    ['螂醍ｴ・焚', '螂醍ｴ・焚逶ｮ讓・, '螂醍ｴ・焚'],
    ['豎ｺ陬∵焚', '豎ｺ陬∵焚逶ｮ讓・, '豎ｺ陬∵焚']
  ];
  return pairs.map(([label, targetKey, actualKey]) => {
    const target = parseNumber_(obj[targetKey]);
    const actual = parseNumber_(obj[actualKey]);
    const rate = target ? Math.round(actual / target * 1000) / 10 : 0;
    return { label, target, actual, rate, diff: actual - target };
  });
}

function isHeadquartersDept_(deptName) {
  return String(deptName || '').indexOf('譛ｬ驛ｨ') !== -1;
}

function isServiceDept_(deptName) {
  return String(deptName || '').indexOf('繧ｵ繝ｼ繝薙せ') !== -1;
}

function isSalesDeptAggregateTarget_(deptName) {
  const name = String(deptName || '');
  return !!name && !isHeadquartersDept_(name) && !isServiceDept_(name);
}

function shouldSumSalesDeptHeader_(headerName) {
  const key = String(headerName || '');
  if (!key || ['蟇ｾ雎｡譛・, '譖ｴ譁ｰ譌･譎・, '蝟ｶ讌ｭ驛ｨ蜷・, '陦ｨ遉ｺ蛹ｺ蛻・].indexOf(key) !== -1) return false;
  if (/邇・CVR|騾ｲ謐慾蟷ｳ蝮・@/.test(key)) return false;
  if (/譌･謨ｰ|邨碁℃譌･謨ｰ/.test(key)) return false;
  return true;
}

function buildHeadquartersSalesDeptSummary_(header, objects) {
  const targets = objects.filter(row => isSalesDeptAggregateTarget_(row['蝟ｶ讌ｭ驛ｨ蜷・]));
  const rows = targets.length ? targets : objects;
  const summary = {};
  const first = rows[0] || {};

  header.forEach(key => {
    if (!key) return;
    if (key === '蟇ｾ雎｡譛・) summary[key] = first[key] || getSalesDeptTargetMonth_();
    else if (key === '譖ｴ譁ｰ譌･譎・) summary[key] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm');
    else if (key === '蝟ｶ讌ｭ驛ｨ蜷・) summary[key] = '譛ｬ驛ｨ';
    else if (shouldSumSalesDeptHeader_(key)) {
      const total = rows.reduce((sum, row) => sum + parseNumber_(row[key]), 0);
      summary[key] = total;
    } else {
      summary[key] = '';
    }
  });

  summary['陦ｨ遉ｺ蛹ｺ蛻・] = '莨夂､ｾ蜈ｨ菴・;
  summary['莉頑怦譌･謨ｰ'] = first['莉頑怦譌･謨ｰ'] || getMonthProgress_().monthDays;
  summary['邨碁℃譌･謨ｰ'] = first['邨碁℃譌･謨ｰ'] || getMonthProgress_().elapsedDays;
  summary['譌･謨ｰ騾ｲ謐・] = first['譌･謨ｰ騾ｲ謐・] || formatRate_(summary['邨碁℃譌･謨ｰ'], summary['莉頑怦譌･謨ｰ']);
  summary['譟ｻ螳咾VR'] = formatRate_(summary['譟ｻ螳壼床謨ｰ螳溽ｸｾ'], summary['雋ｷ蜿匁ュ蝣ｱ謨ｰ']);
  summary['雋ｷ蜿匁・邏ГVR'] = formatRate_(summary['雋ｷ蜿門床謨ｰ螳溽ｸｾ'], summary['譟ｻ螳壼床謨ｰ螳溽ｸｾ']);
  summary['雋ｷ蜿匁ュ蝣ｱ謌千ｴ・紫'] = formatRate_(summary['雋ｷ蜿門床謨ｰ螳溽ｸｾ'], summary['雋ｷ蜿匁ュ蝣ｱ謨ｰ']);
  summary['AA蜑ｲ蜷・] = formatRate_(summary['AA蜿ｰ謨ｰ'], summary['雋ｷ蜿門床謨ｰ螳溽ｸｾ']);
  summary['螻慕､ｺ蜑ｲ蜷・] = formatRate_(summary['螻慕､ｺ蜿ｰ謨ｰ'], summary['雋ｷ蜿門床謨ｰ螳溽ｸｾ']);
  summary['關ｽ譛ｭ邇・] = formatRate_(summary['關ｽ譛ｭ蜿ｰ謨ｰ'], summary['AA蜃ｦ逅・'] || summary['AA蜿ｰ謨ｰ']);
  summary['豬∵惆邇・] = formatRate_(summary['豬∵惆蜿ｰ謨ｰ'], summary['AA蜃ｦ逅・'] || summary['AA蜿ｰ謨ｰ']);
  summary['蜿匁ｶ育紫'] = formatRate_(summary['蜿匁ｶ亥床謨ｰ'], summary['AA蜃ｦ逅・'] || summary['AA蜿ｰ謨ｰ']);
  summary['AA@'] = summary['AA蟷ｳ蝮・ｲ怜茜'] = summary['AA蜿ｰ謨ｰ'] ? Math.round(parseNumber_(summary['AA邏熱Q']) / parseNumber_(summary['AA蜿ｰ謨ｰ'])) : '';
  summary['蟷ｳ蝮①'] = summary['雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ'] ? Math.round(parseNumber_(summary['雋ｩ螢ｲ邏熱Q'] || summary['雋ｩ螢ｲMQ']) / parseNumber_(summary['雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ'])) : '';

  ['雋ｷ蜿匁ュ蝣ｱ謨ｰ', '雋ｷ蜿鵬', '譟ｻ螳啣', 'AAQ', '雋ｩ螢ｲQ', 'MQ', 'F', 'G', '莠育ｴ・焚', '螂醍ｴ・焚', '豎ｺ陬∵焚'].forEach(label => {
    const targetKey = label === '雋ｷ蜿鵬' ? '雋ｷ蜿鵬逶ｮ讓・
      : label === '譟ｻ螳啣' ? '譟ｻ螳啣逶ｮ讓・
      : label === 'AAQ' ? 'AAQ逶ｮ讓・
      : label === '雋ｩ螢ｲQ' ? '雋ｩ螢ｲQ逶ｮ讓・
      : `${label}逶ｮ讓兪;
    const progressKey = label === '雋ｷ蜿鵬' ? '雋ｷ蜿鵬騾ｲ謐・
      : label === '譟ｻ螳啣' ? '譟ｻ螳啣騾ｲ謐・
      : label === 'AAQ' ? 'AAQ騾ｲ謐・
      : label === '雋ｩ螢ｲQ' ? '雋ｩ螢ｲQ騾ｲ謐・
      : `${label}騾ｲ謐輿;
    const actualKey = label === '雋ｷ蜿鵬' ? '雋ｷ蜿門床謨ｰ螳溽ｸｾ'
      : label === '譟ｻ螳啣' ? '譟ｻ螳壼床謨ｰ螳溽ｸｾ'
      : label === 'AAQ' ? 'AA蜿ｰ謨ｰ'
      : label === '雋ｩ螢ｲQ' ? '雋ｩ螢ｲ蜿ｰ謨ｰ螳溽ｸｾ'
      : label === 'MQ' ? '繝医・繧ｿ繝ｫMQ'
      : label === 'F' ? '繝医・繧ｿ繝ｫF'
      : label;
    if (summary[targetKey] !== undefined) summary[progressKey] = formatRate_(summary[actualKey], summary[targetKey]);
  });

  return summary;
}

function aggregateDailyRowsForHeadquarters_(rows) {
  const byDate = {};
  rows.forEach(row => {
    const date = row['譌･莉・] || '';
    if (!date) return;
    if (!byDate[date]) {
      byDate[date] = {
        '蟇ｾ雎｡譛・: row['蟇ｾ雎｡譛・] || '',
        '蝟ｶ讌ｭ驛ｨ蜷・: '譛ｬ驛ｨ',
        '譌･莉・: date,
        '譖懈律': row['譖懈律'] || ''
      };
    }
    ['譟ｻ螳壻ｻｶ謨ｰ', '雋ｷ蜿紋ｻｶ謨ｰ', '雋ｩ螢ｲ莉ｶ謨ｰ', '螂醍ｴ・ｻｶ謨ｰ', 'MQ', 'F', 'G'].forEach(key => {
      byDate[date][key] = parseNumber_(byDate[date][key]) + parseNumber_(row[key]);
    });
  });

  return Object.keys(byDate).sort().map(date => {
    const row = byDate[date];
    row['雋ｷ蜿匁・邏ГVR'] = formatRate_(row['雋ｷ蜿紋ｻｶ謨ｰ'], row['譟ｻ螳壻ｻｶ謨ｰ']);
    row['譟ｻ螳咾VR'] = row['譟ｻ螳咾VR'] || '';
    return row;
  });
}

function getSalesDeptTargetMonth_() {
  const now = new Date();
  return Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy/MM');
}

function getMonthProgress_() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthDays = new Date(year, month + 1, 0).getDate();
  const elapsedDays = now.getDate();
  return { monthDays, elapsedDays };
}

function getWeekday_(dateValue) {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';
  return ['譌･', '譛・, '轣ｫ', '豌ｴ', '譛ｨ', '驥・, '蝨・][d.getDay()];
}

function rowToObject_(header, row) {
  const obj = {};
  header.forEach((h, i) => { if (h) obj[h] = row[i] || ''; });
  return obj;
}

function pickObject_(obj, keys) {
  return keys.map(key => ({ label: key, value: obj[key] || '0' }));
}

function buildStoresFromMembers_(deptName) {
  const members = getSalesDeptMembers(deptName);
  const stores = {};

  members.forEach(member => {
    const store = member['諡轤ｹ蜷・] || '譛ｪ險ｭ螳・;
    if (!stores[store]) {
      stores[store] = {
        '蠎苓・蜷・: store,
        '蝟ｶ讌ｭ驛ｨ蜷・: deptName || '',
        '繧ｹ繧ｿ繝・ヵ謨ｰ': 0,
        '螢ｲ荳・: '',
        'MQ': 0,
        'F': 0,
        'G': 0,
        '雋ｷ蜿鵬': 0,
        '雋ｩ螢ｲQ': 0,
        '譟ｻ螳啣': 0,
        '謌千ｴ・紫': '',
        'AA蜑ｲ蜷・: '',
        '螻慕､ｺ蜑ｲ蜷・: '',
        '蝗ｺ螳夊ｲｻ': '',
        '莠ｺ莉ｶ雋ｻ': '',
        '蠎・相雋ｻ': ''
      };
    }

    stores[store]['繧ｹ繧ｿ繝・ヵ謨ｰ'] += 1;
    stores[store]['MQ'] += parseNumber_(member['MQ']);
    stores[store]['雋ｷ蜿鵬'] += parseNumber_(member['雋ｷ蜿鵬']);
    stores[store]['譟ｻ螳啣'] += parseNumber_(member['譟ｻ螳啣']);
  });

  Object.keys(stores).forEach(store => {
    const row = stores[store];
    row['謌千ｴ・紫'] = formatRate_(row['雋ｷ蜿鵬'], row['譟ｻ螳啣']);
  });

  return Object.keys(stores).map(store => stores[store]);
}

function makeSalesDeptHeaderIndex_(header) {
  const idx = {};
  header.forEach((label, i) => {
    const key = String(label || '').trim();
    if (key && idx[key] === undefined) idx[key] = i;
  });
  return idx;
}

function getByHeader_(row, idx, candidates) {
  for (let i = 0; i < candidates.length; i++) {
    const key = candidates[i];
    if (idx[key] !== undefined) return String(row[idx[key]] || '').trim();
  }
  return '';
}

function firstNumber_(row, idx, candidates) {
  const value = getByHeader_(row, idx, candidates);
  return parseNumber_(value);
}

function firstNumberOrNull_(row, idx, candidates) {
  const value = getByHeader_(row, idx, candidates);
  if (value === '') return null;
  return parseNumber_(value);
}

function parseNumber_(value) {
  const num = Number(String(value || '').replace(/[ﾂ･・･,%\s]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatRate_(actual, target) {
  const a = parseNumber_(actual);
  const t = parseNumber_(target);
  if (!t) return '';
  return `${Math.round(a / t * 1000) / 10}%`;
}

function getCachedSalesDept_(key, builder) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore broken cache
    }
  }
  const value = builder();
  const text = JSON.stringify(value);
  if (text.length < 95000) cache.put(key, text, SALES_DEPT_DASH.cacheSeconds);
  return value;
}

function clearSalesDeptDashboardCache_() {
  CacheService.getScriptCache().removeAll(['salesDeptOptions']);
}

// ==========================================
// 雋ｩ螢ｲ譛ｬ驛ｨ繝繝・す繝･繝懊・繝臥ｵｱ蜷育沿
// 蝠・刀雋ｩ螢ｲ蝨ｨ蠎ｫ荳隕ｧ 竊・雋ｩ螢ｲ譛ｬ驛ｨDASH_DB
// ==========================================

const SALES_HQ_DASH = {
  sourceSpreadsheetId: '1uW78_MjTA4r8PEbnUgMN8E1N3PRPDal0TcI2GuWodno',
  sourceSheetName: '商品販売在庫一覧',
  dashSheetName: '雋ｩ螢ｲ譛ｬ驛ｨDASH_DB',

  // 蝠・刀雋ｩ螢ｲ蝨ｨ蠎ｫ荳隕ｧ縺ｮ蛻嶺ｽ咲ｽｮ・・蟋九∪繧・
  // E蛻・= 迥ｶ諷・
  // G蛻・= 譌･莉・
  // O蛻・= 蠎苓・
  statusColIndex: 4,
  dateColIndex: 6,
  storeColIndex: 14,

  targetTurnoverRate: 0.7
};

const SALES_HQ_DASH_HEADERS = [
  '蠎苓・',
  '蜷郁ｨ・,
  '蜈･蠎ｫ蜑・,
  '譛ｪ謗ｲ霈・,
  '螻慕､ｺ荳ｭ',
  '雋ｩ螢ｲ貂・,
  '譏取律莠亥ｮ・,
  '譏主ｾ梧律莠亥ｮ・,
  '譛亥・蝨ｨ蠎ｫ',
  '70%逶ｮ讓・,
  '莉頑怦雋ｩ螢ｲ謨ｰ',
  '騾ｲ謐礼紫',
  '譖ｴ譁ｰ譌･譎・
];

function buildSalesHqDashboardDb() {
  const sourceSs = SpreadsheetApp.openById(SALES_HQ_DASH.sourceSpreadsheetId);
  const sourceSheet = sourceSs.getSheetByName(SALES_HQ_DASH.sourceSheetName);

  if (!sourceSheet) {
    throw new Error('蜈・せ繝励す縺ｫ縲・ + SALES_HQ_DASH.sourceSheetName + '縲阪す繝ｼ繝医′隕九▽縺九ｊ縺ｾ縺帙ｓ縲・);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ensureSalesHqDashSheet_(ss);

  const lastRow = sourceSheet.getLastRow();
  const lastCol = sourceSheet.getLastColumn();

  if (lastRow < 2) {
    throw new Error('蝠・刀雋ｩ螢ｲ蝨ｨ蠎ｫ荳隕ｧ縺ｫ繝・・繧ｿ縺後≠繧翫∪縺帙ｓ縲・);
  }

  if (lastCol < SALES_HQ_DASH.storeColIndex + 1) {
    throw new Error('蝠・刀雋ｩ螢ｲ蝨ｨ蠎ｫ荳隕ｧ縺ｫO蛻励∪縺ｧ蟄伜惠縺励∪縺帙ｓ縲ょ・讒区・繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞縲・);
  }

  const values = sourceSheet.getRange(1, 1, lastRow, lastCol).getValues();

  const today = resetSalesHqTime_(new Date());
  const tomorrow = addSalesHqDays_(today, 1);
  const dayAfterTomorrow = addSalesHqDays_(today, 2);

  const storeSummary = {};

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    const status = normalizeSalesHqText_(row[SALES_HQ_DASH.statusColIndex]);
    const store = normalizeSalesHqText_(row[SALES_HQ_DASH.storeColIndex]) || '譛ｪ險ｭ螳・;
    const dateValue = toSalesHqDate_(row[SALES_HQ_DASH.dateColIndex]);

    if (!status) continue;

    const category = judgeSalesHqCategory_(status);
    if (!category) continue;

    if (!storeSummary[store]) {
      storeSummary[store] = {
        store,
        total: 0,
        beforeArrival: 0,
        notListed: 0,
        onDisplay: 0,
        sold: 0,
        dateTomorrow: 0,
        dateIn2Days: 0,
        soldThisMonth: 0,
        monthStartStock: 0,
        targetSales: 0,
        progressRate: 0
      };
    }

    storeSummary[store][category]++;
    storeSummary[store].total++;

    if (dateValue && isSalesHqSameDate_(dateValue, tomorrow)) {
      storeSummary[store].dateTomorrow++;
    }

    if (dateValue && isSalesHqSameDate_(dateValue, dayAfterTomorrow)) {
      storeSummary[store].dateIn2Days++;
    }

    if (category === 'sold' && dateValue && isSalesHqThisMonth_(dateValue, today)) {
      storeSummary[store].soldThisMonth++;
    }
  }

  const storeArray = Object.keys(storeSummary).map(storeName => storeSummary[storeName]);

  applySalesHqMonthStartStock_(storeArray);

  const updatedAt = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  const rows = storeArray
    .sort((a, b) => b.total - a.total)
    .map(item => [
      item.store,
      item.total,
      item.beforeArrival,
      item.notListed,
      item.onDisplay,
      item.sold,
      item.dateTomorrow,
      item.dateIn2Days,
      item.monthStartStock,
      item.targetSales,
      item.soldThisMonth,
      item.progressRate,
      updatedAt
    ]);

  dashSheet.clearContents();
  dashSheet.getRange(1, 1, 1, SALES_HQ_DASH_HEADERS.length).setValues([SALES_HQ_DASH_HEADERS]);

  if (rows.length > 0) {
    dashSheet.getRange(2, 1, rows.length, SALES_HQ_DASH_HEADERS.length).setValues(rows);
  }

  dashSheet.setFrozenRows(1);
  SpreadsheetApp.flush();

  return {
    ok: true,
    rows: rows.length,
    updatedAt
  };
}

function getSalesHqDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SALES_HQ_DASH.dashSheetName);

  if (!sheet || sheet.getLastRow() < 2) {
    buildSalesHqDashboardDb();
    sheet = ss.getSheetByName(SALES_HQ_DASH.dashSheetName);
  }

  const values = sheet.getDataRange().getDisplayValues();

  if (values.length < 2) {
    return {
      updatedAt: '',
      rows: [],
      totals: {}
    };
  }

  const header = values[0];
  const idx = makeSalesHqHeaderIndex_(header);

  const rows = values.slice(1)
    .filter(row => row[idx['蠎苓・']] !== '')
    .map(row => ({
      store: row[idx['蠎苓・']],
      total: toSalesHqNumber_(row[idx['蜷郁ｨ・]]),
      beforeArrival: toSalesHqNumber_(row[idx['蜈･蠎ｫ蜑・]]),
      notListed: toSalesHqNumber_(row[idx['譛ｪ謗ｲ霈・]]),
      onDisplay: toSalesHqNumber_(row[idx['螻慕､ｺ荳ｭ']]),
      sold: toSalesHqNumber_(row[idx['雋ｩ螢ｲ貂・]]),
      dateTomorrow: toSalesHqNumber_(row[idx['譏取律莠亥ｮ・]]),
      dateIn2Days: toSalesHqNumber_(row[idx['譏主ｾ梧律莠亥ｮ・]]),
      monthStartStock: toSalesHqNumber_(row[idx['譛亥・蝨ｨ蠎ｫ']]),
      targetSales: toSalesHqNumber_(row[idx['70%逶ｮ讓・]]),
      soldThisMonth: toSalesHqNumber_(row[idx['莉頑怦雋ｩ螢ｲ謨ｰ']]),
      progressRate: toSalesHqNumber_(row[idx['騾ｲ謐礼紫']]),
      updatedAt: row[idx['譖ｴ譁ｰ譌･譎・]]
    }))
    .sort((a, b) => b.sold - a.sold);

  const totals = calculateSalesHqTotals_(rows);

  return {
    updatedAt: rows[0] ? rows[0].updatedAt : '',
    rows,
    totals
  };
}

function refreshSalesHqDashboardData() {
  buildSalesHqDashboardDb();
  return getSalesHqDashboardData();
}

function resetSalesHqMonthStartStock() {
  const ym = getSalesHqYearMonthKey_(new Date());
  PropertiesService.getScriptProperties().deleteProperty('SALES_HQ_MONTH_START_STOCK_' + ym);
  buildSalesHqDashboardDb();

  return {
    ok: true,
    message: '譛亥・蝨ｨ蠎ｫ繧堤樟蝨ｨ蛟､縺ｧ蜀崎ｨｭ螳壹＠縺ｾ縺励◆縲・
  };
}

function ensureSalesHqDashSheet_(ss) {
  let sheet = ss.getSheetByName(SALES_HQ_DASH.dashSheetName);

  if (!sheet) {
    sheet = ss.insertSheet(SALES_HQ_DASH.dashSheetName);
  }

  sheet.getRange(1, 1, 1, SALES_HQ_DASH_HEADERS.length).setValues([SALES_HQ_DASH_HEADERS]);
  sheet.setFrozenRows(1);

  return sheet;
}

function judgeSalesHqCategory_(status) {
  const text = normalizeSalesHqText_(status);

  if (text === '雋ｩ螢ｲ貂・ || text === '雋ｩ螢ｲ貂医∩') {
    return 'sold';
  }

  if (text === '蜈･蠎ｫ蜑・) {
    return 'beforeArrival';
  }

  if (text === '螻慕､ｺ荳ｭ') {
    return 'onDisplay';
  }

  if (text === '蜈･蠎ｫ貂医∩' || text === '蜈･蠎ｫ貂・) {
    return 'notListed';
  }

  return '';
}

function applySalesHqMonthStartStock_(storeArray) {
  const ym = getSalesHqYearMonthKey_(new Date());
  const propertyKey = 'SALES_HQ_MONTH_START_STOCK_' + ym;

  const props = PropertiesService.getScriptProperties();
  let saved = props.getProperty(propertyKey);

  let monthStartMap = {};

  if (saved) {
    try {
      monthStartMap = JSON.parse(saved);
    } catch (e) {
      monthStartMap = {};
    }
  }

  let changed = false;

  storeArray.forEach(item => {
    if (monthStartMap[item.store] === undefined) {
      monthStartMap[item.store] = item.total;
      changed = true;
    }

    const monthStartStock = Number(monthStartMap[item.store] || 0);
    const targetSales = Math.ceil(monthStartStock * SALES_HQ_DASH.targetTurnoverRate);
    const progressRate = targetSales > 0
      ? Math.round(Number(item.soldThisMonth || 0) / targetSales * 100)
      : 0;

    item.monthStartStock = monthStartStock;
    item.targetSales = targetSales;
    item.progressRate = progressRate;
  });

  if (changed || !saved) {
    props.setProperty(propertyKey, JSON.stringify(monthStartMap));
  }
}

function calculateSalesHqTotals_(rows) {
  const totals = {
    total: 0,
    beforeArrival: 0,
    notListed: 0,
    onDisplay: 0,
    sold: 0,
    dateTomorrow: 0,
    dateIn2Days: 0,
    monthStartStock: 0,
    targetSales: 0,
    soldThisMonth: 0,
    progressRate: 0
  };

  rows.forEach(row => {
    totals.total += Number(row.total || 0);
    totals.beforeArrival += Number(row.beforeArrival || 0);
    totals.notListed += Number(row.notListed || 0);
    totals.onDisplay += Number(row.onDisplay || 0);
    totals.sold += Number(row.sold || 0);
    totals.dateTomorrow += Number(row.dateTomorrow || 0);
    totals.dateIn2Days += Number(row.dateIn2Days || 0);
    totals.monthStartStock += Number(row.monthStartStock || 0);
    totals.targetSales += Number(row.targetSales || 0);
    totals.soldThisMonth += Number(row.soldThisMonth || 0);
  });

  totals.progressRate = totals.targetSales > 0
    ? Math.round(totals.soldThisMonth / totals.targetSales * 100)
    : 0;

  return totals;
}

function normalizeSalesHqText_(value) {
  return String(value || '').trim();
}

function toSalesHqDate_(value) {
  if (!value) return null;

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return resetSalesHqTime_(value);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return null;

  return resetSalesHqTime_(date);
}

function resetSalesHqTime_(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addSalesHqDays_(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return resetSalesHqTime_(d);
}

function isSalesHqSameDate_(a, b) {
  return resetSalesHqTime_(a).getTime() === resetSalesHqTime_(b).getTime();
}

function isSalesHqThisMonth_(date, today) {
  const d = resetSalesHqTime_(date);
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

function getSalesHqYearMonthKey_(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyyMM');
}

function toSalesHqNumber_(value) {
  const n = Number(String(value || '').replace(/[,%・・/g, '').trim());
  return isNaN(n) ? 0 : n;
}

function makeSalesHqHeaderIndex_(header) {
  const idx = {};

  header.forEach((label, i) => {
    const key = String(label || '').trim();
    if (key) idx[key] = i;
  });

  return idx;
}
// ==========================================
// 雋ｷ蜿匁悽驛ｨ繝繝・す繝･繝懊・繝牙ｰら畑DB
// 蝟ｶ讌ｭ驛ｨDASH_DB 竊・雋ｷ蜿匁悽驛ｨDASH_DB
// ==========================================

const PURCHASE_HQ_DASH = {
  sourceSheetName: '蝟ｶ讌ｭ驛ｨDASH_DB',
  dashSheetName: '雋ｷ蜿匁悽驛ｨDASH_DB'
};

const PURCHASE_HQ_DASH_HEADERS = [
  '蟇ｾ雎｡譛・,
  '譖ｴ譁ｰ譌･譎・,
  '蝟ｶ讌ｭ驛ｨ蜷・,

  '雋ｷ蜿匁ュ蝣ｱ謨ｰ',
  '髢狗､ｺ謨ｰ',
  '譟ｻ螳啣',
  '雋ｷ蜿鵬',
  '謌千ｴГVR',
  '譟ｻ螳咾VR',
  '雋ｷ蜿匁ュ蝣ｱ謌千ｴ・紫',

  'AAQ',
  '蝠・刀Q',
  '繧ｹ繧ｯ繝ｩ繝・・Q',
  '莉｣霆害',
  'AA豈皮紫',
  '蝠・刀豈皮紫',
  '繧ｹ繧ｯ繝ｩ繝・・豈皮紫',
  '莉｣霆頑ｯ皮紫',

  'AA蜃ｦ逅・',
  'AA譛ｪ蜃ｦ逅・',
  'AAMQ',
  'AA邏熱Q',
  'AA@',
  'AA關ｽ譛ｭQ',
  'AA豬∵惆Q',
  'AA蜿匁ｶ・',
  'AA鄙梧怦Q',
  '繧ｹ繧ｯ繝ｩ繝・・邊怜茜',

  '蠖捺怦AA蜃ｺ蜩＿',
  'AA逶ｸ驕媛',
  'AA逶ｸ驕墓ｯ皮紫',
  '蠖捺怦蜃ｺ蜩＿',
  '蠖捺怦蜃ｺ蜩∵ｯ皮紫',
  '蜈･蠎ｫ蟷ｳ蝮・律謨ｰ',
  '雋ｷ蜿悶く繝｣繝ｳ繧ｻ繝ｫQ',
  '繧ｭ繝｣繝ｳ繧ｻ繝ｫ豈皮紫',

  '繝翫ン繧ｯ繝ｫ莠育ｴ・,
  '繝翫ン繧ｯ繝ｫ螂醍ｴ・,
  '繝翫ン繧ｯ繝ｫ邇・,
  '繝｢繝ｼ繧ｿ莠育ｴ・,
  '繝｢繝ｼ繧ｿ螂醍ｴ・,
  '繝｢繝ｼ繧ｿ邇・,
  '蟐剃ｽ鼎莠育ｴ・,
  '蟐剃ｽ鼎螂醍ｴ・,
  '蟐剃ｽ鼎邇・,
  '蟐剃ｽ泥莠育ｴ・,
  '蟐剃ｽ泥螂醍ｴ・,
  '蟐剃ｽ泥邇・,
  '蟐剃ｽ摘莠育ｴ・,
  '蟐剃ｽ摘螂醍ｴ・,
  '蟐剃ｽ摘邇・,
  '蟐剃ｽ擢莠育ｴ・,
  '蟐剃ｽ擢螂醍ｴ・,
  '蟐剃ｽ擢邇・,

  '邱丈ｺ育ｴ・,
  '邱丞･醍ｴ・,
  '邱乗・邏・,

  'MOTA邱乗焚',
  'MOTA邱城幕遉ｺ謨ｰ',
  '邱城幕遉ｺ邇・,
  'MOTA逶ｴ霑醍ｷ乗焚',
  'MOTA讀懆ｨ守ｷ乗焚',
  'MOTA鬘募惠邱乗焚',
  '逶ｴ霑鷹幕遉ｺ',
  '讀懆ｨ朱幕遉ｺ',
  '鬘募惠髢狗､ｺ',
  '逶ｴ霑鷹幕遉ｺ邇・,
  '讀懆ｨ朱幕遉ｺ邇・,
  '鬘募惠髢狗､ｺ邇・,
  '譟ｻ螳夂ｷ乗焚',
  '譟ｻ螳夂紫',
  '謌千ｴ・ｷ乗焚',
  '邱乗・邏・紫',
  '邱乗侭驥・,
  '髢狗､ｺ諠・ｱ謌千ｴ・紫',
  '諠・ｱ謌千ｴ・紫',
  '蜊ｳ譌･譟ｻ螳・,
  '驕主悉蠖捺律譟ｻ螳・,
  '驕主悉蠕梧律譟ｻ螳・,
  '蠕梧律譟ｻ螳・,
  '蜊ｳ譌･譟ｻ螳壽・邏・,
  '驕主悉蠖捺律謌千ｴ・,
  '驕主悉蠕梧律謌千ｴ・,
  '蠕梧律謌千ｴ・,
  '蜊ｳ譌･譟ｻ螳壽ｯ皮紫',
  '驕主悉蠖捺律譟ｻ螳壽ｯ皮紫',
  '驕主悉蠕梧律譟ｻ螳壽ｯ皮紫',
  '蠕梧律譟ｻ螳壽ｯ皮紫',
  '蜊ｳ譌･謌千ｴ・ｯ皮紫',
  '驕主悉蠖捺律謌千ｴ・ｯ皮紫',
  '驕主悉蠕梧律謌千ｴ・ｯ皮紫',
  '蠕梧律謌千ｴ・ｯ皮紫',
  '蜊ｳ豎ｺ螂醍ｴ・焚',
  '邂｡逅・･醍ｴ・焚',
  'MQ'
];

function createPurchaseHqDashboardSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensurePurchaseHqSheet_(ss);
  return { ok: true };
}

function buildPurchaseHqDashboardDb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let source = ss.getSheetByName(PURCHASE_HQ_DASH.sourceSheetName);

  // 蝟ｶ讌ｭ驛ｨDASH_DB縺後↑縺代ｌ縺ｰ蜈医↓菴懈・
  if (!source) {
    if (typeof buildSalesDeptDashboardAllDbs === 'function') {
      buildSalesDeptDashboardAllDbs();
    }
    source = ss.getSheetByName(PURCHASE_HQ_DASH.sourceSheetName);
  }

  if (!source) {
    throw new Error('蝟ｶ讌ｭ驛ｨDASH_DB 縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲ょ・縺ｫ蝟ｶ讌ｭ驛ｨDASH_DB繧剃ｽ懈・縺励※縺上□縺輔＞縲・);
  }

  const target = ensurePurchaseHqSheet_(ss);

  const values = source.getDataRange().getDisplayValues();
  if (values.length < 2) {
    writePurchaseHqRows_(target, []);
    return { ok: true, rows: 0 };
  }

  const header = values[0];
  const rows = values.slice(1).filter(row => row.some(cell => String(cell || '').trim() !== ''));

  const output = rows.map(row => {
    const obj = purchaseRowToObject_(header, row);

    const assessmentQ = purchaseValue_(obj, ['譟ｻ螳啣', '譟ｻ螳夲ｼｱ', '譟ｻ螳壼床謨ｰ螳溽ｸｾ']);
    const purchaseQ = purchaseValue_(obj, ['雋ｷ蜿鵬', '雋ｷ蜿厄ｼｱ', '雋ｷ蜿門床謨ｰ螳溽ｸｾ']);
    const aaQ = purchaseValue_(obj, ['AAQ', 'AA蜿ｰ謨ｰ']);
    const itemQ = purchaseValue_(obj, ['蝠・刀Q', '螻慕､ｺ蜿ｰ謨ｰ']);
    const scrapQ = purchaseValue_(obj, ['繧ｹ繧ｯ繝ｩ繝・・Q', '繧ｹ繧ｯ繝ｩ繝・・蜿ｰ謨ｰ']);
    const daishaQ = purchaseValue_(obj, ['莉｣霆害', '莉｣霆雁床謨ｰ']);

    return PURCHASE_HQ_DASH_HEADERS.map(label => {
      switch (label) {
        case '蟇ｾ雎｡譛・:
          return purchaseValue_(obj, ['蟇ｾ雎｡譛・]);

        case '譖ｴ譁ｰ譌･譎・:
          return new Date();

        case '蝟ｶ讌ｭ驛ｨ蜷・:
          return purchaseValue_(obj, ['蝟ｶ讌ｭ驛ｨ蜷・]);

        case '譟ｻ螳啣':
          return assessmentQ;

        case '雋ｷ蜿鵬':
          return purchaseQ;

        case '謌千ｴГVR':
          return purchaseRate_(purchaseQ, assessmentQ);

        case '譟ｻ螳咾VR':
          return purchaseValue_(obj, ['譟ｻ螳咾VR']);

        case 'AAQ':
          return aaQ;

        case '蝠・刀Q':
          return itemQ;

        case '繧ｹ繧ｯ繝ｩ繝・・Q':
          return scrapQ;

        case '莉｣霆害':
          return daishaQ;

        case 'AA豈皮紫':
          return purchaseRate_(aaQ, purchaseQ);

        case '蝠・刀豈皮紫':
          return purchaseRate_(itemQ, purchaseQ);

        case '繧ｹ繧ｯ繝ｩ繝・・豈皮紫':
          return purchaseRate_(scrapQ, purchaseQ);

        case '莉｣霆頑ｯ皮紫':
          return purchaseRate_(daishaQ, purchaseQ);

        case 'AA@':
          return purchaseValue_(obj, ['AA@', 'AA蟷ｳ蝮・ｲ怜茜']);

        case '蟐剃ｽ鼎莠育ｴ・:
          return purchaseValue_(obj, ['蟐剃ｽ鼎莠育ｴ・, '蟐剃ｽ難ｼ｣莠育ｴ・]);

        case '蟐剃ｽ鼎螂醍ｴ・:
          return purchaseValue_(obj, ['蟐剃ｽ鼎螂醍ｴ・, '蟐剃ｽ難ｼ｣螂醍ｴ・]);

        default:
          return purchaseValue_(obj, [label]);
      }
    });
  });

  writePurchaseHqRows_(target, output);

  return {
    ok: true,
    rows: output.length,
    updatedAt: new Date()
  };
}

function getPurchaseHqDashboard(deptName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(PURCHASE_HQ_DASH.dashSheetName);

  if (!sheet || sheet.getLastRow() < 2) {
    buildPurchaseHqDashboardDb();
    sheet = ss.getSheetByName(PURCHASE_HQ_DASH.dashSheetName);
  }

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) {
    return {
      options: [],
      selectedDept: '',
      summary: {},
      rows: []
    };
  }

  const header = values[0];
  const rows = values.slice(1).filter(row => row.some(cell => String(cell || '').trim() !== ''));

  const objects = rows.map(row => purchaseRowToObject_(header, row));
  const options = objects.map(row => row['蝟ｶ讌ｭ驛ｨ蜷・]).filter(Boolean);

  const selected = deptName && options.includes(deptName)
    ? deptName
    : options[0];

  const summary = objects.find(row => row['蝟ｶ讌ｭ驛ｨ蜷・] === selected) || objects[0] || {};

  return {
    options,
    selectedDept: selected,
    summary,
    rows: objects
  };
}

function refreshPurchaseHqDashboardData() {
  buildPurchaseHqDashboardDb();

  return {
    ok: true,
    data: getPurchaseHqDashboard()
  };
}

function ensurePurchaseHqSheet_(ss) {
  let sheet = ss.getSheetByName(PURCHASE_HQ_DASH.dashSheetName);

  if (!sheet) {
    sheet = ss.insertSheet(PURCHASE_HQ_DASH.dashSheetName);
  }

  sheet.getRange(1, 1, 1, PURCHASE_HQ_DASH_HEADERS.length).setValues([PURCHASE_HQ_DASH_HEADERS]);
  sheet.setFrozenRows(1);

  return sheet;
}

function writePurchaseHqRows_(sheet, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, PURCHASE_HQ_DASH_HEADERS.length).setValues([PURCHASE_HQ_DASH_HEADERS]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, PURCHASE_HQ_DASH_HEADERS.length).setValues(rows);
  }
}

function purchaseRowToObject_(header, row) {
  const obj = {};

  header.forEach((h, i) => {
    if (h) obj[String(h).trim()] = row[i] || '';
  });

  return obj;
}

function purchaseValue_(obj, candidates) {
  for (let i = 0; i < candidates.length; i++) {
    const key = candidates[i];
    if (obj[key] !== undefined && obj[key] !== '') {
      return obj[key];
    }
  }
  return 0;
}

function purchaseNumber_(value) {
  const n = Number(String(value || '').replace(/[ﾂ･・･,%\s,]/g, ''));
  return isNaN(n) ? 0 : n;
}

function purchaseRate_(num, den) {
  const n = purchaseNumber_(num);
  const d = purchaseNumber_(den);

  if (!d) return '0.00%';

  return `${Math.round((n / d) * 10000) / 100}%`;
}
