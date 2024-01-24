import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { fetchTests } from '../../common/api.js';

import { tableHeaderCell, filterBox } from './styles.module.css';
import { Source } from './source.jsx';

export const Tests = () => {
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [testName, setTestName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchTests().then(({ data }) => {
      setTests(data);
    })
  }, []);

  useEffect(() => {
    const twoWeeksAgo = Date.now() - 1000 * 60 * 60 * 24 * 14;
    const stats = tests.reduce((acc, test) => {
      if (test.timestamp < twoWeeksAgo) {
        return acc;
      }
      return {
        ...acc,
        [test.testName]: acc[test.testName] ? acc[test.testName] + 1 : 1,
      }
    }, {});
    const statsArr = Object.entries(stats);
    statsArr.sort((a,b) => a[1] > b[1] ? -1 : 1)
    setStats(statsArr.slice(0,10));
    setFilteredTests(tests.map((item) => {
      if (testName.length && !item.testName.includes(testName)) {
        return null;
      }
      if (dateFrom.length) {
        const itemDate = new Date(item.timestamp).getTime();
        const dateFromTimestamp = new Date(dateFrom).getTime();
        if (isNaN(itemDate) || isNaN(dateFromTimestamp) || itemDate < dateFromTimestamp) {
          return null;
        }
      }
      if (dateTo.length) {
        const itemDate = new Date(item.timestamp).getTime();
        const dateToTimestamp = new Date(dateTo).getTime();
        if (isNaN(itemDate) || isNaN(dateToTimestamp) || itemDate > dateToTimestamp) {
          return null;
        }
      }
      return item;
    }).filter((item) => item !== null).slice(0, 100));
  }, [tests, dateFrom, dateTo, setFilteredTests, testName]);

  const onTestNameChange = (e) => {
    setTestName(e.target.value.trim());
  }
  const onDateFromChange = (e) => {
    setDateFrom(e.target.value.trim());
  }
  const onDateToChange = (e) => {
    setDateTo(e.target.value.trim());
  }

  return (
    <>
      <Button component={Link} to="/">Back</Button>
      <h4>Most failed tests</h4>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell className={tableHeaderCell}>Test name</TableCell>
                <TableCell className={tableHeaderCell}>Number of failures in the past two weeks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <h4>All test failures</h4>
      <div className={filterBox}>
        <TextField id="standard-basic" label="Name" variant="standard" value={testName} onChange={onTestNameChange} />
        <TextField id="standard-basic" label="Date from" variant="standard" value={dateFrom} onChange={onDateFromChange} />
        <TextField id="standard-basic" label="Date to" variant="standard" value={dateTo} onChange={onDateToChange} />
      </div>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell className={tableHeaderCell}>#</TableCell>
                <TableCell className={tableHeaderCell}>Test name</TableCell>
                <TableCell className={tableHeaderCell}>Job</TableCell>
                <TableCell className={tableHeaderCell}>Config</TableCell>
                <TableCell className={tableHeaderCell}>Status</TableCell>
                <TableCell className={tableHeaderCell}>Node</TableCell>
                <TableCell className={tableHeaderCell} sx={{ minWidth: 75}}>Date</TableCell>
                <TableCell className={tableHeaderCell}>Build</TableCell>
                <TableCell className={tableHeaderCell}>Built On</TableCell>
                <TableCell className={tableHeaderCell}>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{index + 1}</TableCell>
                  <TableCell>{row.testName}</TableCell>
                  <TableCell>{row.jobName}</TableCell>
                  <TableCell>{row.config}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.nodeVersion}</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>{new Date(row.timestamp).toISOString()}</TableCell>
                  <TableCell>
                    <a href={row.buildUrl} target="_blank" rel="noreferrer">{row.buildNumber}</a>
                  </TableCell>
                  <TableCell>{row.builtOn}</TableCell>
                  <TableCell>
                    <Source callStack={row.callStack} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  )
}
