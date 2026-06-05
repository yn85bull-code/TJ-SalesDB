(async()=>{
 const id='1uW78_MjTA4r8PEbnUgMN8E1N3PRPDal0TcI2GuWodno';
 const res=await fetch(`https://docs.google.com/spreadsheets/d/${id}/edit?usp=sharing`);
 const text=await res.text();
 require('fs').writeFileSync('work/choshinsekai-edit.html', text, 'utf8');
 const a='店舗別集計'; const b='商品販売在庫一覧';
 console.log(res.status, text.length);
 console.log(text.includes(a), text.includes(b));
})().catch(e=>{console.error(e); process.exit(1);});
