import fs from 'fs';
import { getPrs, getTests } from './common.js';

const tests = getTests();
const PRs = getPrs(false);
const PRsUnstable = getPrs(true);

const chunkSize = 20000;
const numFiles = Math.ceil(tests.length / chunkSize);
const files = [];
for (let i = 0; i < numFiles; i++) {
  const chunk = tests.slice(i * chunkSize, (i + 1) * chunkSize);
  const data = JSON.stringify({ data: chunk });
  const file = `dist/assets/tests${i}.json`;
  files.push(file);
  fs.writeFileSync(file, data, 'utf8');
}
fs.writeFileSync('dist/assets/tests.json', JSON.stringify({ data: files }), 'utf8');

fs.writeFileSync('dist/assets/prs.json', JSON.stringify({ data: PRs }), 'utf8');
fs.writeFileSync('dist/assets/prs_unstable.json', JSON.stringify({ data: PRsUnstable }), 'utf8');

fs.copyFileSync('dist/index.html', 'dist/404.html');
