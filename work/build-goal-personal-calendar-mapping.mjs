import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "outputs/reference-mapping";
const outputPath = `${outputDir}/TJ-SalesDB_目標個人カレンダー_参照マッピング記入表.xlsx`;

const headers = [
  "No",
  "メニュー",
  "セクション",
  "OS表示項目",
  "単位/型",
  "現在の候補名",
  "記入_参照シート名",
  "記入_セル/範囲",
  "記入_列名",
  "記入_集計条件",
  "記入例の値",
  "優先度",
  "備考"
];

const rows = [];
function add(menu, section, item, unit, candidates, cell = "", col = "", condition = "", priority = "高", note = "") {
  rows.push([
    rows.length + 1,
    menu,
    section,
    item,
    unit,
    candidates,
    "超新世界リンクOS",
    cell,
    col,
    condition,
    "",
    priority,
    note
  ]);
}

[
  ["目標", "G目標", "千円", "G目標 / 粗利目標", "P15"],
  ["目標", "MQ目標", "千円", "MQ目標", "P16"],
  ["目標", "買取Q目標", "台", "買取Q目標 / 買取目標", "P17"],
  ["目標", "販売Q目標", "台", "販売Q目標 / 販売目標", "P18"],
  ["目標", "落札MQ目標", "千円", "落札MQ目標 / AAMQ目標", "P19"],
  ["目標", "販売総MQ目標", "千円", "販売総MQ目標 / 販売MQ目標", "P20"],
  ["目標", "査定CVR目標", "%", "査定CVR目標 / 査定率目標", "P21"],
  ["目標", "成約CVR目標", "%", "成約CVR目標 / 成約率目標", "P22"],
  ["目標", "AA@目標", "千円", "AA@目標 / AA＠目標", "P23"],
  ["目標", "納車@目標", "千円", "納車@目標 / 納車＠目標", "P24"],
  ["目標", "回転率目標", "回", "回転率目標 / 回転数目標", "P25"],
  ["目標", "情報数目標", "件", "情報数目標", "P26"],
  ["目標", "開示数目標", "件", "開示数目標", "P27"],
  ["目標", "査定数目標", "件", "査定数目標", "P28"],
  ["目標", "成約数目標", "件", "成約数目標 / 契約数目標", "P29"],
  ["予想実績", "回転率予想", "回", "回転率予想 / 回転数予想", "Q25"],
  ["予想実績", "情報数予想", "件", "情報数予想", "Q26"],
  ["予想実績", "開示数予想", "件", "開示数予想", "Q27"],
  ["予想実績", "査定数予想", "件", "査定数予想", "Q28"],
  ["予想実績", "成約数予想", "件", "成約数予想 / 契約数予想", "Q29"],
  ["実績", "G実績", "千円", "G / 粗利", "E2"],
  ["実績", "MQ実績", "千円", "MQ", "D2"],
  ["実績", "買取Q実績", "台", "買取Q / 買取Ｑ", "C6"],
  ["実績", "販売Q実績", "台", "販売Q / 販売Ｑ", "C20"],
  ["実績", "査定Q実績", "台", "査定Q / 査定Ｑ", "B6"],
  ["実績", "落札MQ実績", "千円", "落札MQ / AAMQ", "B16"],
  ["実績", "販売総MQ実績", "千円", "販売総MQ", "J24"],
  ["実績", "査定CVR実績", "%", "査定CVR / 査定率", "D6"],
  ["実績", "成約CVR実績", "%", "成約CVR / 成約率", "E6"],
  ["実績", "AA@実績", "千円", "AA@ / AA＠", "C16"],
  ["実績", "納車@実績", "千円", "納車@ / 納車＠", "I24"],
  ["実績", "回転率実績", "回", "回転率 / 回転数", "K22"],
  ["実績", "情報数実績", "件", "情報数", "M6"],
  ["実績", "開示数実績", "件", "開示数", "N6"],
  ["実績", "査定数実績", "件", "査定数", "O6"],
  ["実績", "成約数実績", "件", "成約数 / 契約数", "Q6"]
].forEach(r => add("目標管理", ...r));

[
  ["個人実績表", "個人実績表範囲", "範囲", "個人実績 / 個人別実績", "A31:L63", "", "", "高", "A31:L63を表として読み込み。空白行は除外。"],
  ["個人実績表", "氏名", "文字", "氏名 / 名前 / スタッフ名", "A31:L63", "氏名"],
  ["個人実績表", "役職", "文字", "役職", "A31:L63", "役職", "", "中", "列がない場合は空欄表示。"],
  ["個人実績表", "ランク", "文字", "ランク", "A31:L63", "ランク", "", "中", "列がない場合は空欄表示。"],
  ["個人実績表", "所属拠点", "文字", "所属拠点 / 拠点名 / 店舗名", "A31:L63", "所属拠点", "", "中", "列がない場合は空欄表示。"],
  ["個人実績表", "査定Q", "台", "査定Q / 査定Ｑ", "A31:L63", "査定Q"],
  ["個人実績表", "買取Q", "台", "買取Q / 買取Ｑ", "A31:L63", "買取Q"],
  ["個人実績表", "販売Q", "台", "販売Q / 販売Ｑ", "A31:L63", "販売Q"],
  ["個人実績表", "MQ", "千円", "MQ", "A31:L63", "MQ"],
  ["個人実績表", "予約数", "件", "予約数", "A31:L63", "予約数", "", "中"],
  ["個人実績表", "契約数", "件", "契約数 / 成約数", "A31:L63", "契約数", "", "中"],
  ["個人実績表", "成約率", "%", "成約率 / 成約CVR", "A31:L63", "成約率", "", "中"],
  ["個人実績表", "決裁数", "件", "決裁数", "A31:L63", "決裁数", "", "中"],
  ["個人実績表", "目標受注", "台", "目標受注 / 受注目標", "A31:L63", "目標受注", "", "中"],
  ["個人実績表", "目標MQ", "千円", "目標MQ", "A31:L63", "目標MQ", "", "中"],
  ["ランキング", "MQランキング", "千円", "MQ", "A31:L63", "MQ", "降順上位", "高", "個人実績表から1-3位/1-5位を生成。"],
  ["ランキング", "買取ランキング", "台", "買取Q / 買取Ｑ", "A31:L63", "買取Q", "降順上位", "高"],
  ["ランキング", "販売ランキング", "台", "販売Q / 販売Ｑ", "A31:L63", "販売Q", "降順上位", "高"],
  ["ランキング", "査定ランキング", "台", "査定Q / 査定Ｑ", "A31:L63", "査定Q", "降順上位", "中", "必要なら表示。"]
].forEach(r => add("個人実績", ...r));

[
  ["カレンダー表", "カレンダー表範囲", "範囲", "カレンダー / 日別実績", "N31:T62", "", "", "高", "月末までの行を読み込み。31日月も対応。"],
  ["カレンダー表", "日付", "日付", "日付 / 月日", "N31:T62", "日付"],
  ["カレンダー表", "曜日", "文字", "曜日", "N31:T62", "曜日", "", "中", "列がない場合は日付からGASで算出。"],
  ["日別実績", "買取Q", "台", "買取Q / 買取Ｑ", "N31:T62", "買取Q"],
  ["日別実績", "販売Q", "台", "販売Q / 販売Ｑ", "N31:T62", "販売Q"],
  ["日別実績", "査定Q", "台", "査定Q / 査定Ｑ", "N31:T62", "査定Q"],
  ["日別実績", "成約CVR", "%", "成約CVR / 成約率", "N31:T62", "成約CVR"],
  ["日別実績", "情報数", "件", "情報数", "N31:T62", "情報数"],
  ["日別実績", "配車Q", "台", "配車Q / 配車Ｑ", "N31:T62", "配車Q", "", "中", "販売実績推移の2軸グラフで使用。"],
  ["日別実績", "開示数", "件", "開示数", "N31:T62", "開示数", "", "中"],
  ["日別実績", "契約数", "件", "契約数 / 成約数", "N31:T62", "契約数", "", "中"],
  ["カレンダー属性", "土日祝判定", "文字", "土日祝 / 休日区分", "N31:T62", "休日区分", "", "中", "列がない場合は日曜・土曜のみGAS判定。祝日は別途マスタが必要。"],
  ["推移グラフ", "買取実績推移", "グラフ", "日付 + 買取Q + 査定Q", "N31:T62", "日付/買取Q/査定Q", "日別2軸折れ線", "高"],
  ["推移グラフ", "販売実績推移", "グラフ", "日付 + 販売Q + 配車Q", "N31:T62", "日付/販売Q/配車Q", "日別2軸折れ線", "高"],
  ["推移グラフ", "日別情報数推移", "グラフ", "日付 + 情報数", "N31:T62", "日付/情報数", "日別折れ線", "高"]
].forEach(r => add("カレンダー", ...r));

const workbook = Workbook.create();

function addSheet(name, dataRows) {
  const sheet = workbook.worksheets.add(name);
  const values = [headers, ...dataRows];
  const endRow = values.length;
  sheet.getRange(`A1:M${endRow}`).values = values;
  sheet.freezePanes.freezeRows(1);
  sheet.getRange("A1:M1").format = {
    fill: "#111318",
    font: { color: "#FFFFFF", bold: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true
  };
  sheet.getRange(`A2:M${endRow}`).format = {
    borders: { preset: "all", style: "thin", color: "#D1D5DB" },
    verticalAlignment: "top",
    wrapText: true
  };
  sheet.getRange(`G2:J${endRow}`).format.fill = "#FFF2CC";
  sheet.getRange(`L2:L${endRow}`).format.fill = "#FCE4D6";
  sheet.getRange("A:A").format.columnWidthPx = 48;
  sheet.getRange("B:B").format.columnWidthPx = 110;
  sheet.getRange("C:C").format.columnWidthPx = 140;
  sheet.getRange("D:D").format.columnWidthPx = 160;
  sheet.getRange("E:E").format.columnWidthPx = 80;
  sheet.getRange("F:F").format.columnWidthPx = 240;
  sheet.getRange("G:G").format.columnWidthPx = 150;
  sheet.getRange("H:H").format.columnWidthPx = 120;
  sheet.getRange("I:I").format.columnWidthPx = 160;
  sheet.getRange("J:J").format.columnWidthPx = 180;
  sheet.getRange("K:K").format.columnWidthPx = 96;
  sheet.getRange("L:L").format.columnWidthPx = 72;
  sheet.getRange("M:M").format.columnWidthPx = 280;
  sheet.getRange(`A1:M${endRow}`).format.autofitRows();
}

addSheet("全体一覧", rows);
addSheet("目標管理", rows.filter(r => r[1] === "目標管理"));
addSheet("個人実績", rows.filter(r => r[1] === "個人実績"));
addSheet("カレンダー", rows.filter(r => r[1] === "カレンダー"));

await fs.mkdir(outputDir, { recursive: true });
const blob = await SpreadsheetFile.exportXlsx(workbook);
await blob.save(outputPath);
console.log(outputPath);
