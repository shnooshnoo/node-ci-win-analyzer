import fs from 'fs';
import { f, domain } from './common.js';

export async function parsePRs() {
  const req = await f(`${domain}job/node-test-pull-request/api/json?tree=builds[actions[*[*]],description,id,timestamp,result,subBuilds[jobName,build[jobName,buildNumber,result,subBuilds[jobName,result,buildNumber]]]]`);
  const data = await req.json();
  let filesAdded = 0;

  for (let i = 0; i < data.builds.length; i++) {
    const filePath = `history/pr/${data.builds[i].id}.json`;
    if (data.builds[i].result !== 'FAILURE' || fs.existsSync(filePath)) {
      continue;
    }
    fs.writeFileSync(filePath, JSON.stringify(data.builds[i]), 'utf8');
    filesAdded++;
  }

  console.log(`PR Files added: `, filesAdded);
}
