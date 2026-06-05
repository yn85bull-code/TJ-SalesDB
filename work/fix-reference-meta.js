const fs = require('fs');
const path = 'outputs/tj-sales-os-reference-dashboard-Code.gs';
let text = fs.readFileSync(path, 'utf8');
text = text.replace(/('髢狗､ｺ謨ｰ'\s*:\s*)'O6'/u, "$1'N6'");
text = text.replace(/('譟ｻ螳壽焚'\s*:\s*)'P6'/u, "$1'O6'");
fs.writeFileSync(path, text, 'utf8');
