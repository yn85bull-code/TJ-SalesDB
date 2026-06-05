import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/user/Downloads/TJ-SalesDB_目標個人カレンダー_参照マッピング記入表.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));

async function getRows(name) {
  const info = await wb.inspect({
    kind: "table",
    range: `${name}!A1:M160`,
    include: "values",
    tableMaxRows: 160,
    tableMaxCols: 13
  });
  const obj = JSON.parse(info.ndjson);
  const rows = [];
  for (const r of obj.values.slice(1)) {
    if (!r?.[0]) continue;
    rows.push({
      no: String(r[0]),
      menu: r[1] ?? "",
      section: r[2] ?? "",
      item: r[3] ?? "",
      unit: r[4] ?? "",
      candidates: r[5] ?? "",
      sheet: r[6] ?? "",
      cell: r[7] ?? "",
      col: r[8] ?? "",
      condition: r[9] ?? "",
      sample: r[10] ?? "",
      priority: r[11] ?? "",
      note: r[12] ?? ""
    });
  }
  return rows;
}

const sheets = wb.worksheets.items.map(s => s.name);
console.log("SHEETS\t" + sheets.join(","));

const allRows = await getRows("全体一覧");
const all = new Map(allRows.map(r => [r.no, r]));

for (const sheetName of ["目標管理", "個人実績", "カレンダー"]) {
  const rows = await getRows(sheetName);
  const byNo = new Map(rows.map(r => [r.no, r]));
  console.log(`---COMPARE ${sheetName}---`);
  let count = 0;
  for (const a of allRows.filter(r => r.menu === sheetName)) {
    const b = byNo.get(a.no);
    if (!b) {
      console.log(`${a.no}\t${a.item}\t個別なし\t全体:${a.cell}/${a.col}`);
      count++;
      continue;
    }
    const diffs = [];
    for (const key of ["section", "item", "unit", "sheet", "cell", "col", "condition", "priority", "note"]) {
      if (String(a[key] ?? "") !== String(b[key] ?? "")) {
        diffs.push(`${key}: 全体「${a[key] ?? ""}」 / 個別「${b[key] ?? ""}」`);
      }
    }
    if (diffs.length) {
      console.log(`${a.no}\t${a.item}\t${diffs.join(" ; ")}`);
      count++;
    }
  }
  if (!count) console.log("ズレなし");
}

for (const name of ["全体一覧", "目標管理", "個人実績", "カレンダー"]) {
  const rows = await getRows(name);
  console.log(`---ROWS ${name}---`);
  for (const r of rows) {
    console.log([
      r.no,
      r.menu,
      r.section,
      r.item,
      r.unit,
      r.sheet,
      r.cell,
      r.col,
      r.condition,
      r.priority,
      r.note
    ].join("\t"));
  }
}
