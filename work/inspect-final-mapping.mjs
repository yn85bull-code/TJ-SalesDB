import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "C:/Users/user/Downloads/TJ-SalesDB_買取販売情報詳細_参照マッピング記入表.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
for (const name of ["全体一覧","買取詳細","販売詳細","情報詳細"]) {
  const info = await wb.inspect({kind:"table", range:`${name}!A1:M120`, include:"values", tableMaxRows:120, tableMaxCols:13});
  const obj = JSON.parse(info.ndjson);
  console.log(`--- ${name} ---`);
  for (const row of obj.values.slice(1)) {
    if (!row?.[0]) continue;
    const no = row[0], menu = row[1], section = row[2], item = row[3], unit = row[4], sheet = row[6], cell = row[7], col = row[8], priority = row[11], note = row[12];
    console.log([no, menu, section, item, unit, sheet, cell, col, priority, note].map(v => v ?? "").join("\t"));
  }
}
