import fs from 'fs';
import { f, domain } from './common.js';

const failStatuses = ['FAILURE', 'UNSTABLE'];

export async function parsePRs() {
  const req = await f(`${domain}job/node-test-pull-request/api/json?tree=builds[actions[*[*]],id,timestamp,result,subBuilds[jobName,build[jobName,buildNumber,result,subBuilds[jobName,result,buildNumber]]]]`);
  const data = await req.json();
  let filesAdded = 0;

  for (let i = 0; i < data.builds.length; i++) {
    const filePath = `history/pr/${data.builds[i].id}.json`;
    if (!failStatuses.includes(data.builds[i].result) || fs.existsSync(filePath)) {
      continue;
    }
    for (let build of data.builds[i].subBuilds) {
      for (let subBuild of build.build.subBuilds) {
        const { jobName, result, buildNumber } = subBuild;
        if (jobName === 'node-test-commit-windows-fanned' && (result === 'FAILURE' || result === 'UNSTABLE')) {
          const res = await f(`https://ci.nodejs.org/job/node-test-commit-windows-fanned/${buildNumber}/api/json?tree=subBuilds[jobName,result]`);
          const json = await res.json();
          subBuild.phases = json.subBuilds;
        }
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data.builds[i]), 'utf8');
    filesAdded++;
  }

  console.log(`PR Files added: `, filesAdded);
}
