import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { fetchTests, fetchPRs } from '../../common/api.js';
import { TestsTable } from './tests-table.jsx'
import { TestsChart } from './tests-chart.jsx'
import { PRsChart } from './prs-chart.jsx';
import { PlatformsChart } from './platforms-chart.jsx';
import { WindowsChart } from './winows-chart.jsx';

import {
  container,
} from './styles.module.css';

export const noFailuresJobName = 'node-test-commit';
export const multipleFailuresJobName = 'node-test-commit-multiple';
export const windowsJobName = 'node-test-commit-windows-fanned';

export const Dashboard = () => {
  // STATE
  const [data, setData] = useState({ tests: [], prs: [] });
  const [duration, setDuration] = useState(7);
  const [includeFlaky, setIncludeFlaky] = useState(false);
  const [includeUnstable, setIncludeUnstable] = useState(false);
  const [testsDataCount, setTestsDataCount] = useState(10);
  const [excludeSinglePR, setExcludeSinglePR] = useState(false);
  const [filteredData, setFilteredData] = useState({ tests: [], prs: [] });
  const [testsData, setTestsData] = useState({ table: [], chart: [] });
  const [prsData, setPRsData] = useState({ prs: {}, platforms: { chart: {}, data: {}, pie: {}, windows: {} }, windows: {} });

  // EFFECTS
  useEffect(() => {
    fetchTests().then(({ data: tests }) => {
      fetchPRs(includeUnstable).then(({ data: prs }) => {
        setData({ tests, prs });
      });
    });
  }, [includeUnstable]);

  useEffect(() => {
    const startDate = duration?.start || Date.now() - duration * 24 * 60 * 60 * 1000;
    const endDate = duration?.end || Date.now();

    const tests = data.tests.filter(test => {
      const checkDuration = test.timestamp >= startDate && endDate >= test.timestamp;
      const isFlaky = typeof test?.tap?.todo === 'string' && test.tap.todo.includes('Fix flaky test');
      const checkFlaky = includeFlaky || !isFlaky;
      return checkDuration && checkFlaky;
    });

    const prs = data.prs.filter(pr => {
      const prDate = new Date(pr.date);
      const checkDuration = prDate >= startDate && endDate >= prDate;
      return checkDuration;
    });

    setFilteredData({ tests, prs });
  }, [data, duration, includeFlaky]);

  useEffect(() => {
    const prToBuildMap = {};
    for (const pr of filteredData.prs) {
      prToBuildMap[pr.prId] = pr.id;
    }

    const table = Object.entries(filteredData.tests.reduce((result, test) => {
      if (!result[test.testName]) {
        result[test.testName] = { total: 0, flaky: 0, builds: [], prs: [], data: [] };
      }

      ++result[test.testName].total;
      if (typeof test?.tap?.todo === 'string' && test.tap.todo.includes('Fix flaky test')) {
        ++result[test.testName].flaky;
      }
      if (!result[test.testName].builds.includes(test.buildNumber)) {
        result[test.testName].builds.push(test.buildNumber);
      }
      if (test.callStack.length && test.callStack[test.callStack.length - 1].prId && !result[test.testName].prs.includes(test.callStack[test.callStack.length - 1].prId)) {
        result[test.testName].prs.push(test.callStack[test.callStack.length - 1].prId);
      }
      result[test.testName].data.push(test);

      return result;
    }, {})).filter(test => !excludeSinglePR || test[1].prs.length > 1).sort((a, b) => a[1].total > b[1].total ? -1 : 1).slice(0, testsDataCount);

    const chart = Object.entries(filteredData.tests.reduce((result, test) => {
      const testDate = new Date(test.timestamp).toLocaleDateString();
      if (!result[testDate]) {
        result[testDate] = { tests: 0, builds: [], prs: [] };
      }

      ++result[testDate].tests;
      if (!result[testDate].builds.includes(test.buildNumber)) {
        result[testDate].builds.push(test.buildNumber);
      }
      if (test.callStack.length && test.callStack[test.callStack.length - 1].prId && !result[testDate].prs.includes(test.callStack[test.callStack.length - 1].prId)) {
        result[testDate].prs.push(test.callStack[test.callStack.length - 1].prId);
      }

      return result;
    }, {})).reverse();

    setTestsData({ table, chart });
  }, [testsDataCount, excludeSinglePR, filteredData]);

  useEffect(() => {
    const filteredPRs = filteredData.prs.filter(pr => {
      const hasResult = pr.subBuilds.length && typeof pr.subBuilds[0]?.build?.result === 'string'
      const isUnstable = pr.subBuilds[0]?.build?.result === 'UNSTABLE';
      const checkUnstable = includeUnstable || !isUnstable;
      return hasResult && checkUnstable;
    }).reverse();

    const prs = filteredPRs.reduce((result, pr) => {
      if (!result[pr.date]) {
        result[pr.date] = { builds: [], prs: [], platforms: {} };
      }

      if (!result[pr.date].builds.includes(pr.id)) {
        result[pr.date].builds.push(pr.id);
      }
      if (!result[pr.date].prs.includes(pr.prId)) {
        result[pr.date].prs.push(pr.prId);
      }

      const failures = pr.subBuilds[0].build.subBuilds.filter(build => build.result !== 'SUCCESS');
      if (failures.length === 1) {
        if (!result[pr.date].platforms[failures[0].jobName]) {
          result[pr.date].platforms[failures[0].jobName] = { builds: [], prs: [] };
        }

        if (!result[pr.date].platforms[failures[0].jobName].builds.includes(pr.id)) {
          result[pr.date].platforms[failures[0].jobName].builds.push(pr.id);
        }
        if (!result[pr.date].platforms[failures[0].jobName].prs.includes(pr.prId)) {
          result[pr.date].platforms[failures[0].jobName].prs.push(pr.prId);
        }
      } else {
        const jobName = failures.length ? multipleFailuresJobName : noFailuresJobName;
        if (!result[pr.date].platforms[jobName]) {
          result[pr.date].platforms[jobName] = { builds: [], prs: [], platforms: {} };
        }

        if (!result[pr.date].platforms[jobName].builds.includes(pr.id)) {
          result[pr.date].platforms[jobName].builds.push(pr.id);
        }
        if (!result[pr.date].platforms[jobName].prs.includes(pr.prId)) {
          result[pr.date].platforms[jobName].prs.push(pr.prId);
        }

        for (const failure of failures) {
          if (!result[pr.date].platforms[jobName].platforms[failure.jobName]) {
            result[pr.date].platforms[jobName].platforms[failure.jobName] = { builds: [], prs: [] };
          }

          if (!result[pr.date].platforms[jobName].platforms[failure.jobName].builds.includes(pr.id)) {
            result[pr.date].platforms[jobName].platforms[failure.jobName].builds.push(pr.id);
          }
          if (!result[pr.date].platforms[jobName].platforms[failure.jobName].prs.includes(pr.prId)) {
            result[pr.date].platforms[jobName].platforms[failure.jobName].prs.push(pr.prId);
          }
        }
      }

      return result;
    }, {});

    const platforms = Object.entries(prs).reduce((result, pr) => {
      const jobNames = filteredPRs.length ? [noFailuresJobName, multipleFailuresJobName, ...filteredPRs[filteredPRs.length - 1].subBuilds[0].build.subBuilds.map(build => build.jobName)] : [];

      result.chart[pr[0]] = { total: pr[1].builds.length };
      for (const jobName of jobNames) {
        result.chart[pr[0]][jobName] = {
          single: pr[1].platforms[jobName]?.builds.length || 0,
          multiple: pr[1].platforms[multipleFailuresJobName]?.platforms[jobName]?.builds.length || 0
        };

        if (!result.data[jobName]) {
          result.data[jobName] = [];
        }
        result.data[jobName].push({
          count: result.chart[pr[0]][jobName],
          share: {
            single: (result.chart[pr[0]][jobName].single / pr[1].builds.length) * 100,
            multiple: (result.chart[pr[0]][jobName].multiple / pr[1].builds.length) * 100
          }
        });

        if (!result.pie[jobName]) {
          result.pie[jobName] = {
            single: 0,
            multiple: 0
          };
        }
        result.pie[jobName].single += result.chart[pr[0]][jobName].single;
        result.pie[jobName].multiple += result.chart[pr[0]][jobName].multiple;

        if (jobName === windowsJobName) {
          if (!result.windows.single || !result.windows.multiple) {
            result.windows.single = [];
            result.windows.multiple = [];
          }
          result.windows.single.push(result.data[jobName][result.data[jobName].length - 1].share.single)
          result.windows.multiple.push(result.data[jobName][result.data[jobName].length - 1].share.multiple)
        }
      }

      return result;
    }, { chart: {}, data: {}, pie: {}, windows: {} });

    const windows = Object.entries(filteredPRs
      .filter(pr => pr.subBuilds[0].build.subBuilds.length)
      .map(pr => {
        for (const subBuild of pr.subBuilds[0].build.subBuilds) {
          if (subBuild.jobName === windowsJobName && subBuild.result === 'FAILURE') {
            return {
              buildNumber: subBuild.buildNumber,
              phases: subBuild.phases
            };
          }
        }
      }).filter(build => build)
      .reduce((result, build) => {
        for (const phase of build.phases) {
          if (phase.result === 'FAILURE') {
            if (!result[phase.jobName]) {
              result[phase.jobName] = [];
            }

            result[phase.jobName].push(build.buildNumber);
            ++result.total;
          }
        }

        return result;
      }, { total: 0 }))
      .reduce((result, build, _, builds) => {
        if (build[0] !== 'total') {
          result[build[0]] = {
            count: build[1].length,
            share: build[1].length / builds[0][1] * 100,
            builds: build[1]
          };
        }

        return result;
      }, {});

    setPRsData({ prs, platforms, windows });
  }, [includeUnstable, filteredData]);

  // HANDLERS
  const onDurationChange = e => {
    setDuration(typeof e.target.value === 'string' ? JSON.parse(e.target.value) : e.target.value);
  }

  const onIncludeFlakyChanged = (_, checked) => {
    setIncludeFlaky(checked)
  }

  const onIncludeUnstableChanged = (_, checked) => {
    setIncludeUnstable(checked)
  }

  const onTestsDataCountChange = e => {
    setTestsDataCount(e.target.value);
  }

  const onExcludeSinglePRChanged = (_, checked) => {
    setExcludeSinglePR(checked)
  }

  // VIEW
  return (
    <div className={container}>
      <Button component={Link} to="/">Back</Button>
      <h2>Dashboard</h2>
      
      <h4>Settings</h4>

      <Select
        value={typeof duration === 'object' ? JSON.stringify(duration) : duration}
        onChange={onDurationChange}
      >
        <MenuItem value={1}>1 day</MenuItem>
        <MenuItem value={7}>7 days</MenuItem>
        <MenuItem value={15}>15 days</MenuItem>
        <MenuItem value={30}>30 days</MenuItem>
        <MenuItem value={90}>90 days</MenuItem>
        <MenuItem value={180}>180 days</MenuItem>
        <MenuItem value={365}>365 days</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 0).getTime(), end: new Date(2024, 1).getTime() })}>January 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 1).getTime(), end: new Date(2024, 2).getTime() })}>February 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 2).getTime(), end: new Date(2024, 3).getTime() })}>March 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 3).getTime(), end: new Date(2024, 4).getTime() })}>April 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 4).getTime(), end: new Date(2024, 5).getTime() })}>May 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 5).getTime(), end: new Date(2024, 6).getTime() })}>June 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 0).getTime(), end: new Date(2024, 3).getTime() })}>Q1 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 3).getTime(), end: new Date(2024, 6).getTime() })}>Q2 2024</MenuItem>
        <MenuItem value={JSON.stringify({ start: new Date(2024, 0).getTime(), end: new Date(2024, 6).getTime() })}>H1 2024</MenuItem>
      </Select>
      Duration

      <Checkbox
        checked={includeFlaky}
        onChange={onIncludeFlakyChanged}
      />
      Include flaky tests

      <Checkbox
        checked={includeUnstable}
        onChange={onIncludeUnstableChanged}
      />
      Include unstable builds

      <Select
        value={testsDataCount}
        onChange={onTestsDataCountChange}
      >
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={20}>20</MenuItem>
        <MenuItem value={50}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
      </Select>
      Number of tests

      <Checkbox
        checked={excludeSinglePR}
        onChange={onExcludeSinglePRChanged}
      />
      Exclude tests from single PR

      <hr></hr>
      <h2>Windows</h2>

      <h4>Most failed tests</h4>
      <TestsTable includeFlaky={includeFlaky} table={testsData.table} prs={filteredData.prs} />

      <h4>CI failures chart (Windows)</h4>
      <TestsChart chart={testsData.chart} />

      <hr></hr>
      <h2>CI</h2>

      <h4>CI failures chart (All)</h4>
      <PRsChart chart={prsData.prs} />

      <PlatformsChart chart={prsData.platforms.chart} data={prsData.platforms.data} pie={prsData.platforms.pie} windows={prsData.platforms.windows} />

      <h4>Windows job failures</h4>
      <WindowsChart windows={prsData.windows} />
    </div>
  )
}
