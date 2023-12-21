import express from 'express';
import fs from 'fs';
import { resolve } from 'path';

const app = express();
const port = 3000;

app.get('/', function(req, res) {
  res.sendFile(resolve('public/index.html'));
});

app.get('/pr', async (req, res) => {
  const prPath = 'history/pr';
  const prFileNames = fs.readdirSync(prPath);

  const data = prFileNames.map((filename) => {
    const content = fs.readFileSync(`${prPath}/${filename}`, 'utf-8');
    return JSON.parse(content);
  })
  data.sort((a,b) => a.timestamp < b.timestamp ? 1 : -1);

  res.json({ data });
});

app.get('/tests', async (req, res) => {
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

  res.json({
    data: data.map((test) => {
      return {
        ...test,
        config: test.config.split('»')[1].split('#')[0].trim(),
      }
    }),
  })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
