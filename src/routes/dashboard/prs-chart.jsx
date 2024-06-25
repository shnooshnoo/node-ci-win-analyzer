import { LineChart } from '@mui/x-charts/LineChart';

import { useState } from 'react';

export const PRsChart = ({ chart }) => {
  const [width, setWidth] = useState(window.innerWidth);

  const onResize = () => {
    setWidth(window.innerWidth - 32);
  }

  window.addEventListener('resize', onResize);
  
  return (
    <div>
      <LineChart
        xAxis={[
          {
            data: Object.entries(chart).map(value => value[0]),
            scaleType: 'point',
          },
        ]}
        series={[
          {
            label: 'Builds',
            data: Object.entries(chart).map(value => value[1].builds.length),
          },
          {
            label: 'PRs',
            data: Object.entries(chart).map(value => value[1].prs.length),
          },
        ]}
        width={width}
        height={500}
      />
    </div>
  )
}
