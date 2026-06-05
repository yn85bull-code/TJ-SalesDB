import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "C:/Users/user/Downloads/TJ-SalesDB_目標個人カレンダー_参照マッピング記入表.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
for (const range of ["全体一覧!A1:M20", "目標管理!A1:M5", "個人実績!A1:M5", "カレンダー!A1:M5"]) {
  const info = await wb.inspect({kind:"table", range, include:"values", tableMaxRows:20, tableMaxCols:13});
  console.log('---'+range+'---');
  console.log(info.ndjson);
}
