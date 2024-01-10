import fs from 'fs';
import { getPrs, getTests } from './common.js';

const tests = getTests();
const PRs = getPrs(false);
const PRsUnstable = getPrs(true);

fs.writeFileSync('compiledData/tests.json', JSON.stringify({ data: tests }), 'utf8');
fs.writeFileSync('compiledData/prs.json', JSON.stringify({ data: PRs }), 'utf8');
fs.writeFileSync('compiledData/prs_unstable.json', JSON.stringify({ data: PRsUnstable }), 'utf8');
