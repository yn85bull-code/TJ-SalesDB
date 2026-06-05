(async () => {
  const res=await fetch('https://docs.google.com/spreadsheets/d/1uzzA7hHHPS1WaEACwKK82XL8cuEy4LQmAP_jiz7ycoE/gviz/tq?tqx=out:json');
  const text=await res.text();
  const json=JSON.parse(text.match(/setResponse\((.*)\);?$/s)[1]);
  const cols=json.table.cols.map((c,i)=>({index:i+1,label:c.label||''}));
  require('fs').writeFileSync('work/current-source-headers.json', JSON.stringify(cols,null,2), 'utf8');
  console.log(JSON.stringify({count:cols.length, headers:cols}, null, 2));
})();
