import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import classNames from 'classnames';

import { container, statsContainer, tableHeaderCell, filterBox, chartsContainer, failedWinBuild, unstableWinBuild } from './styles.module.css';
import { ChartJobsShare } from './chart-jobs-share.jsx';
import { ChartBuildsShare } from './chart-builds-share.jsx';

export const PRs = () => {
  const [includeUnstable, setIncludeUnstable] = useState(true);
  const [date, setDate] = useState('');
  const [failuresByDate, setFailuresByDate] = useState(null);
  const [stats, setStats] = useState({});
  const [builds, setBuilds] = useState([]);
  const [filteredBuilds, setFilteredBuilds] = useState([]);

  const isBuildFailed = useCallback((result) => {
    if (includeUnstable) {
      return result === 'FAILURE' || result === 'UNSTABLE';
    }
    return result === 'FAILURE';
  }, [includeUnstable]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/prs?includeUnstable=${includeUnstable}`).then((res) => res.json()).then(({ data }) => {
      setBuilds(data);

      const updatedFailuresByDate = {};

      for (let item of data) {
        if (!updatedFailuresByDate[item.date]) {
          updatedFailuresByDate[item.date] = {
            total: 0,
            totalFailures: 0,
            totalJobs: 0,
            win: 0,
            winShare: 0,
            winOnly: 0,
            winOnlyShare: 0,
          };
        }

        for (let build of item.subBuilds) {
          updatedFailuresByDate[item.date].total++;
          let isWinOnly = true;
          let allJobsFailed = true;

          for (let subBuild of build.build.subBuilds) {
            updatedFailuresByDate[item.date].totalJobs++;
            if (isBuildFailed(subBuild.result)) {
              updatedFailuresByDate[item.date].totalFailures++;
              if (subBuild.jobName === 'node-test-commit-windows-fanned') {
                updatedFailuresByDate[item.date].win++;
              } else {
                isWinOnly = false;
              }
            } else {
              allJobsFailed = false;
            }
          }
          if (isWinOnly && !allJobsFailed) {
            updatedFailuresByDate[item.date].winOnly++;
          }
        }

        updatedFailuresByDate[item.date].winShare = (updatedFailuresByDate[item.date].win * 100 / updatedFailuresByDate[item.date].totalFailures).toFixed(2);
        updatedFailuresByDate[item.date].winOnlyShare = (updatedFailuresByDate[item.date].winOnly * 100 / updatedFailuresByDate[item.date].total).toFixed(2);
      }
      setFailuresByDate(updatedFailuresByDate);
    })
  }, [includeUnstable, isBuildFailed]);

  useEffect(() => {
    const filteredBuilds = builds.map((item) => {
      if (date.length && item.date !== date) {
        return null;
      }
      return item;
    }).filter((item) => item !== null);

    setFilteredBuilds(filteredBuilds.slice(0, 50));

    const stats = filteredBuilds.reduce((acc, item) => {
      const currentStats = { ...acc };

      for (let build of item.subBuilds) {
        currentStats.total++;
        let isWinOnly = true;
        let allJobsFailed = true;

        for (let subBuild of build.build.subBuilds) {
          currentStats.totalJobs++;
          if (isBuildFailed(subBuild.result)) {
            currentStats.totalFailures++;
            if (subBuild.jobName === 'node-test-commit-windows-fanned') {
              currentStats.win++;
            } else {
              isWinOnly = false;
            }
          } else {
            allJobsFailed = false;
          }
        }
        if (isWinOnly && !allJobsFailed) {
          currentStats.winOnly++;
        }
      }
      return currentStats;
    }, {
      total: 0,
      totalFailures: 0,
      totalJobs: 0,
      win: 0,
      winShare: 0,
      winOnly: 0,
      winOnlyShare: 0,
    });
    stats.winShare = (stats.win * 100 / stats.totalFailures).toFixed(2);
    stats.winOnlyShare = (stats.winOnly * 100 / stats.total).toFixed(2);
    setStats(stats);
  }, [builds, date, setFilteredBuilds, isBuildFailed]);

  const onDateChange = (e) => {
    setDate(e.target.value.trim());
  }
  const onUnstableChange = (e, isChecked) => {
    setIncludeUnstable(isChecked);
  }

  return (
    <div className={container}>
      <Button component={Link} to="/">Back</Button>
      <div className={chartsContainer}>
        <ChartJobsShare stats={failuresByDate} />
        <ChartBuildsShare stats={failuresByDate} />
      </div>
      <div className={filterBox}>
        <TextField id="standard-basic" label="Date" variant="standard" value={date} onChange={onDateChange} />
      </div>
      <div>
        <Checkbox
          checked={includeUnstable}
          onChange={onUnstableChange}
        />
        Include unstable
      </div>
      <div className={statsContainer}>
        <span>Total builds: {stats.total}</span>
        <span>Total jobs: {stats.totalJobs}</span>
        <span>Total jobs failed: {stats.totalFailures}</span>
        <span>Windows failures (jobs): {stats.win}</span>
        <span>Windows failures share (jobs): {stats.winShare}% ({stats.win} / {stats.totalFailures})</span>
        <span>Windows-only failures (builds): {stats.winOnly}</span>
        <span>Windows-only failures share (builds): {stats.winOnlyShare}% ({stats.winOnly} / {stats.total})</span>
      </div>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell className={tableHeaderCell}>Build</TableCell>
                <TableCell className={tableHeaderCell}>Job Name</TableCell>
                <TableCell className={tableHeaderCell}>Date</TableCell>
                <TableCell className={tableHeaderCell}>PR</TableCell>
                <TableCell className={tableHeaderCell}>Failed jobs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBuilds.map((row) => (
                row.subBuilds.map((build, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <a href={`https://ci.nodejs.org/job/node-test-pull-request/${row.id}/`} target="_blank" rel="noreferrer">
                        {row.id}
                      </a>
                    </TableCell>
                    <TableCell>{build.jobName}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <a href={`https://github.com/nodejs/node/pull/${row.prId}/`} target="_blank" rel="noreferrer">
                        {row.prId}
                      </a>
                    </TableCell>
                    <TableCell>
                      <ul>
                        {build.build.subBuilds.length === 0 && (
                          <li>{build.jobName}</li>
                        )}
                        {build.build.subBuilds.filter((subBuild) => isBuildFailed(subBuild.result)).map((subBuild, index) => (
                          <li key={index}><span className={classNames({
                            [failedWinBuild]: subBuild.jobName === 'node-test-commit-windows-fanned' && subBuild.result === 'FAILURE',
                            [unstableWinBuild]: subBuild.jobName === 'node-test-commit-windows-fanned' && subBuild.result === 'UNSTABLE',
                          })}>{subBuild.jobName} ({subBuild.result})</span></li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
