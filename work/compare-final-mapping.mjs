import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "C:/Users/user/Downloads/TJ-SalesDB_買取販売情報詳細_参照マッピング記入表.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
async function rows(name){
  const info = await wb.inspect({kind:"table", range:`${name}!A1:M140`, include:"values", tableMaxRows:140, tableMaxCols:13});
  const obj = JSON.parse(info.ndjson);
  const out = new Map();
  for (const r of obj.values.slice(1)) {
    if (!r?.[0]) continue;
    out.set(String(r[0]), {no:r[0], menu:r[1], section:r[2], item:r[3], unit:r[4], sheet:r[6], cell:r[7], col:r[8], prio:r[11], note:r[12]});
  }
  return out;
}
const all = await rows("全体一覧");
for (const name of ["買取詳細","販売詳細","情報詳細"]) {
  const indiv = await rows(name);
  console.log(`--- ${name} ---`);
  let count = 0;
  for (const [no, a] of all) {
    if (a.menu !== name) continue;
    const b = indiv.get(no);
    if (!b) { console.log(`${no}\t${a.item}\t個別なし\t全体:${a.cell||''}`); count++; continue; }
    const diffs = [];
    for (const key of ["section","item","unit","sheet","cell","col","prio","note"]) {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      if (String(av) !== String(bv)) diffs.push(`${key}: 全体「${av}」 / 個別「${bv}」`);
    }
    if (diffs.length) { console.log(`${no}\t${a.item}\t${diffs.join(' ; ')}`); count++; }
  }
  if (!count) console.log("ズレなし");
}
