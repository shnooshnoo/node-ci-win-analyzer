import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export const ChartBuildsShare = ({ stats }) => {
  const [axis, setAxis] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (stats !== null) {
      const statsArr = [];

      for (let [key, value] of Object.entries(stats)) {
        statsArr.push({
          date: key,
          value: parseFloat((value.winOnly * 100 / value.total).toFixed(2)),
        })
      }

      statsArr.sort((a,b) => a.date > b.date ? 1 : -1);
      setAxis(statsArr.map((item) => item.date));
      setData(statsArr.map((item) => item.value));
    }
  }, [stats]);

  if (axis.length === 0) {
    return null;
  }

  return (
    <div>
      <h4>Windows-only failures share (builds)</h4>
      <LineChart
        xAxis={[
          {
            id: 'Date',
            data: axis,
            scaleType: 'point',
          },
        ]}
        series={[
          {
            data,
          },
        ]}
        width={500}
        height={300}
      />
    </div>
  )
}
