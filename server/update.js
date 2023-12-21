import { parseTests } from './tests.js';
import { parsePRs } from './pr.js';

await parseTests();
await parsePRs();
