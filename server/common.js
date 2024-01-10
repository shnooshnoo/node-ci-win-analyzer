import fs from 'fs';

export const domain = 'https://ci.nodejs.org/';

const params = {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('shnooshnoo:11ef43bd6bc463cce94fa1f28e1d6596f1')
  },
};

export const f = (url) => fetch(url, params);

export const getTests = () => {
  const jsSuitesPath = 'history/node-test-binary-windows-js-suites';
  const jsSuitesFileNames = fs.readdirSync(jsSuitesPath);
  const nativeSuitesPath = 'history/node-test-binary-windows-native-suites';
  const nativeSuitesFileNames = fs.readdirSync(nativeSuitesPath);
  const data = [];

  for (let i = 0; i < jsSuitesFileNames.length; i++) {
    const content = fs.readFileSync(`${jsSuitesPath}/${jsSuitesFileNames[i]}`, 'utf-8');
    const tests = JSON.parse(content).failedTests;
    if (tests.length) {
      data.push(...tests);
    }
  }
  for (let i = 0; i < nativeSuitesFileNames.length; i++) {
    const content = fs.readFileSync(`${nativeSuitesPath}/${nativeSuitesFileNames[i]}`, 'utf-8');
    const tests = JSON.parse(content).failedTests;
    if (tests.length) {
      data.push(...tests);
    }
  }

  data.sort((a,b) => a.timestamp < b.timestamp ? 1 : -1);

  return data.map((test) => ({
    ...test,
    config: test.config.split('»')[1].split('#')[0].trim(),
    date: new Date(test.timestamp).toISOString().split('T')[0],
  }));
}

export const getPrs = (includeUnstable) => {
  const prPath = 'history/pr';
  const prFileNames = fs.readdirSync(prPath);

  const data = prFileNames.map((filename) => {
    const content = fs.readFileSync(`${prPath}/${filename}`, 'utf-8');
    return JSON.parse(content);
  })
  data.sort((a,b) => a.timestamp < b.timestamp ? 1 : -1);

  const filteredData = includeUnstable ? data : data.filter((item) => item.result === 'FAILURE');

  return filteredData.map(({ actions, id, timestamp, subBuilds }) => {
    const parameters = actions.find((action) => action._class === "hudson.model.ParametersAction")?.parameters ?? [];
    const prId = parameters.find((param) => param.name === "PR_ID")?.value ?? '';
    return {
      id,
      date: new Date(timestamp).toISOString().split('T')[0],
      prId,
      subBuilds,
    }
  });
}
