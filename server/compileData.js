import fs from 'fs';
import { getPrs, getTests } from './common.js';

const tests = getTests();
const PRs = getPrs(false);
const PRsUnstable = getPrs(true);

fs.writeFileSync('compiledData/tests.json', JSON.stringify(tests), 'utf8');
fs.writeFileSync('compiledData/prs.json', JSON.stringify(PRs), 'utf8');
fs.writeFileSync('compiledData/prs_unstable.json', JSON.stringify(PRsUnstable), 'utf8');
