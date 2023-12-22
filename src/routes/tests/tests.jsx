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

import { tableHeaderCell, filterBox } from './styles.module.css';
import { Source } from './source.jsx';

export const Tests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [testName, setTestName] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/tests').then((res) => res.json()).then(({ data }) => {
      setTests(data);
    })
  }, []);

  useEffect(() => {
    setFilteredTests(tests.map((item) => {
      if (testName.length && !item.testName.includes(testName)) {
        return null;
      }
      if (date.length && item.date !== date) {
        return null;
      }
      return item;
    }).filter((item) => item !== null).slice(0, 50));
  }, [tests, date, setFilteredTests, testName]);

  const onTestNameChange = (e) => {
    setTestName(e.target.value.trim());
  }
  const onDateChange = (e) => {
    setDate(e.target.value.trim());
  }

  return (
    <>
      <Button component={Link} to="/">Back</Button>
      <div className={filterBox}>
        <TextField id="standard-basic" label="Name" variant="standard" value={testName} onChange={onTestNameChange} />
        <TextField id="standard-basic" label="Date" variant="standard" value={date} onChange={onDateChange} />
      </div>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
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
                  <TableCell component="th" scope="row">{row.testName}</TableCell>
                  <TableCell>{row.jobName}</TableCell>
                  <TableCell>{row.config}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.nodeVersion}</TableCell>
                  <TableCell>{row.date}</TableCell>
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
