const fs = require('fs');

const fixedPath = 'outputs/sales-dept-dashboard-html-fixed.txt';
const previewPath = 'outputs/sales-dept-dashboard-preview.html';

const fixed = fs.readFileSync(fixedPath, 'utf8');
const preview = fs.readFileSync(previewPath, 'utf8');

const mockStart = preview.search(/\s*<script>\r?\n\s+window\.google/);
const mainStart = preview.search(/\s*<script>\r?\n\s+let currentDept/);
if (mockStart < 0 || mainStart < 0) {
  throw new Error('Could not locate preview mock script.');
}
const mockScript = preview.slice(mockStart, mainStart);
const firstScript = fixed.search(/\s*<script>\r?\n\s+let currentDept/);
if (firstScript < 0) {
  throw new Error('Could not locate fixed main script.');
}
const synced = fixed.slice(0, firstScript) + mockScript + fixed.slice(firstScript);
fs.writeFileSync(previewPath, synced);
