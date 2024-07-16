import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

import {
  tableHeaderCell
} from './styles.module.css';

export const TestsTable = ({ includeFlaky, table, prs }) => {
  const getTestFailureChart = testData => {
    const chart = {};
    
    for (const test of testData) {
      const testDate = new Date(test.timestamp).toLocaleDateString();
      if (!chart[testDate]) {
        chart[testDate] = 0;
      }
      
      ++chart[testDate];
    }
    
    return chart;
  }
  
  const getTestFailureBuilds = testData => {{
    const isJSSuite = testData.length && testData[0].buildUrl.includes('job/node-test-binary-windows-js-suites');
    const buildUrl = `https://ci.nodejs.org/job/${isJSSuite ? 'node-test-binary-windows-js-suites' : 'node-test-binary-windows-native-suites'}/`;
    const numbers = [...new Set(testData.map(test => `${buildUrl}${test.buildNumber}`))];
    const urls = testData.map(test => test.buildUrl);
    return { builds: numbers, urls };
  }}
  
  const getTestFailurePRs = testData => {{
    const prToBuildMap = {};
    for (const pr of prs) {
      prToBuildMap[pr.prId] = pr.id;
    }
    
    const numbers = []
    for (const test of testData) {
      if (test.callStack.length && test.callStack[test.callStack.length - 1].prId && !numbers.includes(+test.callStack[test.callStack.length - 1].prId)) {
        numbers.push(+test.callStack[test.callStack.length - 1].prId);
      }
    }
    const urls = numbers.map(pr => `https://github.com/nodejs/node/pull/${pr}`);
    return { prs: numbers, urls };
  }}
  
  return (
    <Paper>
      <TableContainer component={Paper}>
        <Table stickyHeader size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell className={tableHeaderCell}>Name</TableCell>
              <TableCell className={tableHeaderCell}>Failures{includeFlaky ? '(flaky)' : ''} / Builds / PRs</TableCell>
              <TableCell className={tableHeaderCell}>Actions</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
        {table.map((row, index) => (
          <TableRow
            key={index}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">{row[0]}</TableCell>
            <TableCell>{row[1].total}{row[1].flaky ? <span>({row[1].flaky})</span> : null} / {row[1].builds.length} / {row[1].prs.length}</TableCell>
            <TableCell>
              <Button onClick={() => {
                window.open(`https://github.com/nodejs/reliability/issues?q=is%3Aissue+is%3Aopen+${encodeURI(row[0])}`)
              }}>Reliability</Button>
              <Button onClick={() => {
                console.clear();
                console.log(row[0])
                console.log(row[1].data)
              }}>Data</Button>
              <Button onClick={() => {
                console.clear();
                console.log(row[0])
                console.log(getTestFailureChart(row[1].data))
              }}>Chart</Button>
              <Button onClick={() => {
                console.clear();
                console.log(row[0])
                console.log(getTestFailureBuilds(row[1].data))
              }} onDoubleClick={() => {
                for (const build of getTestFailureBuilds(row[1].data).builds) {
                  window.open(build);
                }
              }}>Builds</Button>
              <Button onClick={() => {
                console.clear();
                console.log(row[0])
                console.log(getTestFailurePRs(row[1].data))
              }} onDoubleClick={() => {
                for (const url of getTestFailurePRs(row[1].data).urls) {
                  window.open(url);
                }
              }}>PRs</Button>
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
