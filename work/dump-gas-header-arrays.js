const fs=require('fs');
const gas=fs.readFileSync('outputs/sales-dept-dashboard-gas.txt','utf8');
const headerArrays=[...gas.matchAll(/const\s+(\w+HEADERS)\s*=\s*\[([\s\S]*?)\];/g)].map(m=>({name:m[1],items:[...m[2].matchAll(/'([^']*)'/g)].map(x=>x[1])}));
console.log(JSON.stringify(headerArrays.map(a=>({name:a.name,count:a.items.length,items:a.items})), null, 2));
