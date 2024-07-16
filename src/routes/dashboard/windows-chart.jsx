
import { BarChart } from '@mui/x-charts/BarChart';

import { useState } from 'react';

export const WindowsChart = ({ windows }) => {
  const data = Object.entries(windows).reverse();
  const [width, setWidth] = useState(window.innerWidth);

  const onResize = () => {
    setWidth(window.innerWidth - 32);
  }

  window.addEventListener('resize', onResize);

  return (
    <div>
      <BarChart
        xAxis={[
          {
            data: data.map(value => value[0]),
            scaleType: 'band',
          },
        ]}
        series={[{
            data: data.length ? data.map(value => value[1].share) : [0]
        }]}
        width={width}
        height={500}
      />
    </div>
  )
}
