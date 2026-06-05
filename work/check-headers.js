(async () => {
  const res=await fetch('https://docs.google.com/spreadsheets/d/1uzzA7hHHPS1WaEACwKK82XL8cuEy4LQmAP_jiz7ycoE/gviz/tq?tqx=out:json');
  const text=await res.text();
  const json=JSON.parse(text.match(/setResponse\((.*)\);?$/s)[1]);
  const cols=json.table.cols.map((c,i)=>({i:i+1,label:c.label}));
  const keywords=['キャンセル','入庫','相違','出品','買取','AA','スクラップ','MQ'];
  const hits=cols.filter(c=>keywords.some(k=>c.label.includes(k)));
  console.log(JSON.stringify({count:cols.length,hits}, null, 2));
})();
