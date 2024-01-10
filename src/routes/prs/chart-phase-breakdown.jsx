import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react';

export const ChartPhaseBreakdown = ({ builds, includeUnstable }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const failuresByPhase = {};

    for (let build of builds) {
      for (let subBuild of build.subBuilds) {
        for (let job of subBuild.build.subBuilds) {
          if (job.jobName === 'node-test-commit-windows-fanned' && job.result !== 'SUCCESS' && job.phases) {
            for (let phase of job.phases) {
              if (phase.result === 'SUCCESS') {
                continue;
              }
              if (!includeUnstable && phase.result === 'UNSTABLE') {
                continue;
              }
              if (failuresByPhase[phase.jobName] === undefined) {
                failuresByPhase[phase.jobName] = 0;
              }
              failuresByPhase[phase.jobName]++;
            }
          }
        }
      }
    }
    const total = Object.values(failuresByPhase).reduce((acc, item) => acc + item, 0);
    const names = Object.keys(failuresByPhase);
    names.sort();

    if (names.length) {
      setStats({
        names,
        values: names.map((name) => parseFloat((failuresByPhase[name] * 100 / total).toFixed(2))),
      });
    }
  }, [builds, includeUnstable]);

  if (stats === null) {
    return;
  }

  return (
    <div>
      <h4>Windows failures breakdown by phase, %</h4>
      <BarChart
        xAxis={[{ scaleType: 'band', data: stats.names }]}
        series={[{ data: stats.values }]}
        width={500}
        height={300}
      />
    </div>
  );
}
