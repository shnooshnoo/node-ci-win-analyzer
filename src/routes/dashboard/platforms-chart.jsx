import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts';

import { useState } from 'react';

import { multipleFailuresJobName } from './dashboard'

export const PlatformsChart = ({ chart, data, pie, windows }) => {
  const [width, setWidth] = useState(window.innerWidth);

  const onResize = () => {
    setWidth(window.innerWidth - 32);
  }

  window.addEventListener('resize', onResize);

  return (
    <div>
      <h4>Failures count by platform</h4>
      <LineChart
        xAxis={[
          {
            data: Object.entries(chart).map(value => value[0]),
            scaleType: 'point',
          },
        ]}
        series={
          Object.entries(data).map(value => {
            return {
              label: value[0],
              data: value[1].map(val => val.count.single),
            }
          })
        }
        width={width}
        height={500}
      />

      <h4>Failures share by platform</h4>
      <BarChart
        xAxis={[
          {
            data: Object.entries(chart).map(value => value[0]),
            scaleType: 'band',
          },
        ]}
        series={
          Object.entries(data).map(value => {
            return {
              label: value[0],
              data: value[1].map(val => val.share.single),
              stack: 'total',
              stackOrder: 'descending',
            }
          })
        }
        width={width}
        height={500}
      />
      
      <h4>Failures pie chart by platform (excluding multiplatform failures)</h4>
      <PieChart
        series={[{
          data: Object.entries(pie).filter(value => value[0] !== multipleFailuresJobName).map(value => ({ label: value[0], value: value[1].single})),
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 50, additionalRadius: -50, color: 'gray' },
        }]}
        width={width}
        height={width / 3}
      />

      <h4>Failures pie chart by platform (including multiplatform failures)</h4>
      <PieChart
        series={[{
          data: Object.entries(pie).filter(value => value[0] !== multipleFailuresJobName).map(value => ({ label: value[0], value: value[1].multiple })),
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 50, additionalRadius: -50, color: 'gray' },
        }]}
        width={width}
        height={width / 3}
      />

      <h4>Failures share for Windows</h4>
      <BarChart
        xAxis={[
          {
            data: Object.entries(chart).map(value => value[0]),
            scaleType: 'band',
          },
        ]}
        series={
          Object.entries(windows).map(value => {
            return {
              label: value[0] === 'single' ? 'Windows only failures' : 'Windows joined failures',
              data: value[1],
              stack: 'total',
              stackOrder: 'ascending',
              color: value[0] === 'single' ? 'red' : 'yellow',
            }
          })
        }
        width={width}
        height={500}
      />
    </div>
  )
}
