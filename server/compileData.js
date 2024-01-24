import fs from 'fs';
import { getPrs, getTests } from './common.js';

const tests = getTests();
const PRs = getPrs(false);
const PRsUnstable = getPrs(true);

fs.writeFileSync('dist/assets/tests.json', JSON.stringify({ data: tests }), 'utf8');
fs.writeFileSync('dist/assets/prs.json', JSON.stringify({ data: PRs }), 'utf8');
fs.writeFileSync('dist/assets/prs_unstable.json', JSON.stringify({ data: PRsUnstable }), 'utf8');

fs.copyFileSync('dist/index.html', 'dist/404.html');
