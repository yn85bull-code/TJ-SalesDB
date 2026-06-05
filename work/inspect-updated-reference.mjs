import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/user/Downloads/TJ-SalesDB_買取販売情報詳細_参照マッピング記入表.xlsx";
const file = await FileBlob.load(path);
const wb = await SpreadsheetFile.importXlsx(file);
console.log(wb.worksheets.items.map(s => s.name).join(","));

for (const name of ["買取詳細", "販売詳細", "情報詳細"]) {
  const info = await wb.inspect({
    kind: "table",
    range: `${name}!A1:M120`,
    include: "values",
    tableMaxRows: 120,
    tableMaxCols: 13
  });
  console.log(`---${name}---`);
  console.log(info.ndjson);
}
