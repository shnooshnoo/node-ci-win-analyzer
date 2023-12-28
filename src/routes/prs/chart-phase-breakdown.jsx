import { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export const ChartPhaseBreakdown = ({ builds, includeUnstable }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const total = {};

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
              if (total[phase.jobName] === undefined) {
                total[phase.jobName] = 0;
              }
              total[phase.jobName]++;
            }
          }
        }
      }
    }

    const names = Object.keys(total);
    names.sort();

    setStats({
      names,
      values: names.map((name) => total[name]),
    })
  }, [builds, includeUnstable]);

  return (
    <div>
      <h4>Windows failures breakdown by phase</h4>
      <BarChart
        xAxis={[{ scaleType: 'band', data: stats.names }]}
        series={[{ data: stats.values } ]}
        width={500}
        height={300}
      />
    </div>
  );
}
