import express from 'express';
import { resolve } from 'path';
import { getPrs, getTests } from './common.js';

const app = express();
const port = 3000;

app.get('/api/prs', (req, res) => {
  res.json({
    data: getPrs(req.query.includeUnstable === 'true'),
  });
});

app.get('/api/tests', (req, res) => {
  res.json({ data: getTests() });
});

app.get('*', function(req, res) {
  res.sendFile(resolve('public/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})