import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "outputs/reference-mapping/TJ-SalesDB_目標個人カレンダー_参照マッピング記入表.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
console.log(wb.worksheets.items.map(s => s.name).join(','));
for (const name of ["全体一覧","目標管理","個人実績","カレンダー"]) {
  const info = await wb.inspect({kind:"table", range:`${name}!A1:M8`, include:"values", tableMaxRows:8, tableMaxCols:13});
  console.log(`---${name}---`);
  console.log(info.ndjson);
}
