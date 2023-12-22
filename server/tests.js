import fs from 'fs';
import { Parser } from 'tap-parser';
import { domain, f } from './common.js';

const jobs = [
  'node-test-binary-windows-js-suites',
  'node-test-binary-windows-native-suites',
];
const tapCache = {};
const fetchTap = async (url) => {
  if (tapCache[url] === undefined) {
    const res = await f(`${url}artifact/node/test.tap`);
    const tapData = await res.text();
    const result = Parser.parse(tapData);

    tapCache[url] = result.reduce((acc, item) => {
      if (item[0] !== 'assert') {
        return acc;
      }
      if (item[1].ok) {
        return acc;
      }
      return {
        ...acc,
        [item[1].name.trim()]: item[1],
      }
    }, {});
  }
  return tapCache[url];
};
const brokenBuilds = [24765, 24767];

async function findCauses(job, build) {
  const url = `${domain}job/${job}/${build}/api/json?tree=actions[causes[*],parameters[*]]`;
  const data = await f(url);
  const json = await data.json();
  const causes = json.actions.find((action) => action._class === 'hudson.model.CauseAction')?.causes ?? [];
  const parameters = json.actions.find((action) => action._class === 'hudson.model.ParametersAction')?.parameters ?? [];
  const cause = causes[0] ?? {};
  const prId = parameters.find((param) => param.name === 'PR_ID')?.value ?? null;
  const stack = []

  if (cause.upstreamBuild) {
    stack.push({
      upstreamBuild: cause.upstreamBuild,
      upstreamProject: cause.upstreamProject,
      upstreamUrl: cause.upstreamUrl,
    })
    const deeperCauses = await findCauses(cause.upstreamProject, cause.upstreamBuild);
    if (deeperCauses.length) {
      stack.push(...deeperCauses);
    }
  } else if (prId !== null) {
    stack.push({
      prId,
    })
  }

  return stack;
}

async function parseBuild(jobName, buildNumber) {
  const buildData = await f(`${domain}job/${jobName}/${buildNumber}/testReport/api/json?tree=failCount,childReports[child[actions[parameters[name,value]],number,fullDisplayName,result,timestamp,url,builtOn],result[failCount,suites[cases[className,status,name]]]]`);
  const buildJson = await buildData.json();
  const items = [];

  if (buildJson.failCount === 0) {
    return items;
  }

  for (const report of buildJson.childReports) {
    if (report.result.failCount === 0) {
      continue;
    }

    const parameters = report.child.actions.find((action) => action._class === 'hudson.matrix.MatrixChildParametersAction')?.parameters ?? [];
    const nodeVersion = parameters.find((param) => param.name === 'NODEJS_VERSION')?.value;
    const nodeMajorVersion = parameters.find((param) => param.name === 'NODEJS_MAJOR_VERSION')?.value;
    const commitHash = parameters.find((param) => param.name === 'GIT_COMMIT')?.value;

    const callStack = await findCauses(jobName, buildNumber);
    const tapReport = await fetchTap(report.child.url);

    report.result.suites.forEach((suite) => {
      suite.cases.forEach((test) => {
        if (test.status !== 'PASSED' && test.status !== 'SKIPPED' && test.status !== 'FIXED') {
          const testName = test.name.trim();
          const className = test.className.trim().replace("\\","/");
          const fullName = `${className}/${testName}`;
          const tap = tapReport[fullName] ?? null;

          if (tap === null) {
            console.log('TAP WAS NOT FOUND', jobName, buildNumber, fullName, report.child.url);
          }

          items.push({
            testName: fullName,
            timestamp: report.child.timestamp,
            status: test.status,
            jobName,
            config: report.child.fullDisplayName,
            buildUrl: report.child.url,
            buildNumber: report.child.number,
            builtOn: report.child.builtOn,
            nodeVersion: nodeVersion || nodeMajorVersion,
            commitHash,
            callStack,
            tap,
          })
        }
      })
    })
  }

  return items;
}

async function parseJob(job) {
  const data = await f(`${domain}job/${job}/api/json?tree=lastBuild[number],firstBuild[number]`);
  const json = await data.json();
  const lastBuild = json.lastBuild.number;
  const firstBuild = json.firstBuild.number;
  let filesAdded = 0;

  for (let buildNumber = lastBuild; buildNumber >= firstBuild; buildNumber--) {
    if (brokenBuilds.includes(buildNumber) && job === 'node-test-binary-windows-js-suites') {
      continue;
    }
    const filePath = `history/${job}/${buildNumber}.json`;
    if (!fs.existsSync(filePath)) {
      const buildData = await parseBuild(job, buildNumber);
      fs.writeFileSync(filePath, JSON.stringify({
        failedTests: buildData,
      }), 'utf8');
      filesAdded++;
    }
  }

  console.log(`${job} Files added: `, filesAdded);
}

export async function parseTests() {
  for (let i = 0; i < jobs.length; i++) {
    await parseJob(jobs[i]);
  }
}
