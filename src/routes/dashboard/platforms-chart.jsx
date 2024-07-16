import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts';

import { useState } from 'react';

export const PlatformsChart = ({ chart, data, pie, windows }) => {
  const colors = [
    "#1f77b4", // Blue
    "#ff7f0e", // Orange
    "#2ca02c", // Green
    "#d62728", // Red
    "#9467bd", // Purple
    "#8c564b", // Brown
    "#e377c2", // Pink
    "#7f7f7f", // Gray
    "#bcbd22", // Olive
    "#17becf", // Teal
    "#aec7e8", // Light Blue
    "#ffbb78", // Light Orange
    "#98df8a", // Light Green
    "#ff9896", // Light Red
    "#c5b0d5", // Light Purple
    "#c49c94", // Light Brown
    "#f7b6d2", // Light Pink
    "#c7c7c7", // Light Gray
    "#dbdb8d", // Light Olive
    "#9edae5"  // Light Teal
  ];
  const [width, setWidth] = useState(window.innerWidth);

  const onResize = () => {
    setWidth(window.innerWidth - 32);
  }

  window.addEventListener('resize', onResize);

  return (
    <div>
      <h4>Failures count by platform</h4>
      <LineChart
        colors={colors}
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
        colors={colors}
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
        colors={colors}
        series={[{
          arcLabel: (item) => {
            const percentage = (item.endAngle - item.startAngle) / (2 * Math.PI) * 100;
            return `${item.label} ${percentage.toFixed(0)}%`;
          },
          arcLabelMinAngle: 20,
          data: Object.entries(pie).filter(value => value[0] !== 'Multiplatform').map(value => ({ label: value[0], value: value[1].single})),
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 50, additionalRadius: -50, color: 'gray' },
        }]}
        width={width}
        height={900}
      />

      <h4>Failures pie chart by platform (including multiplatform failures)</h4>
      <PieChart
        colors={colors}
        series={[{
          arcLabel: (item) => {
            const percentage = (item.endAngle - item.startAngle) / (2 * Math.PI) * 100;
            return `${item.label} ${percentage.toFixed(0)}%`;
          },
          arcLabelMinAngle: 20,
          data: Object.entries(pie).filter(value => value[0] !== 'Multiplatform').map(value => ({ label: value[0], value: value[1].multiple })),
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 50, additionalRadius: -50, color: 'gray' },
        }]}
        width={width}
        height={900}
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
              label: value[0] === 'single' ? 'Windows only failures' : value[0] === 'multiple' ? 'Windows joined failures' : 'Other platform failures',
              data: value[1],
              stack: 'total',
              color: value[0] === 'single' ? 'red' : value[0] === 'multiple' ? 'yellow' : 'green',
            }
          })
        }
        width={width}
        height={500}
      />
    </div>
  )
}
