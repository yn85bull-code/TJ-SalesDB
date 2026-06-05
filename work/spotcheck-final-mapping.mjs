import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "C:/Users/user/Downloads/TJ-SalesDB_買取販売情報詳細_参照マッピング記入表.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
for (const name of ["全体一覧","販売詳細","情報詳細"]) {
  const info = await wb.inspect({kind:"table", range:`${name}!A1:M110`, include:"values", tableMaxRows:110, tableMaxCols:13});
  const obj = JSON.parse(info.ndjson);
  console.log(`--- ${name} ---`);
  for (const r of obj.values.slice(1)) {
    if ([44,64,75,76,87,89,90,91,93,103].includes(Number(r?.[0]))) {
      console.log([r[0], r[1], r[2], r[3], r[7], r[8], r[11], r[12]].map(v=>v??"").join("\t"));
    }
  }
}
