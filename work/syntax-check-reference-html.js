const fs = require('fs');
const html = fs.readFileSync('outputs/tj-sales-os-reference-dashboard.html','utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
for (let i = 0; i < scripts.length; i++) {
  try {
    new Function(scripts[i]);
    console.log(`script ${i+1}: OK`);
  } catch (e) {
    console.error(`script ${i+1}: ${e.message}`);
    process.exit(1);
  }
}
