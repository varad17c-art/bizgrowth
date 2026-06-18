import React from 'react';

type Props = {width?: number; height?: number};

const BarChart: React.FC<Props> = ({width = 400, height = 200}) => {
  const bars = [0.7, 0.5, 0.3, 0.9, 0.6];
  const w = width / bars.length;
  return (
    <svg width={width} height={height} role="img" aria-label="Bar chart">
      <rect width="100%" height="100%" fill="#fff" rx={4} />
      {bars.map((v, i) => (
        <rect
          key={i}
          x={i * w + 8}
          y={height - v * (height - 20)}
          width={w - 16}
          height={v * (height - 20)}
          fill="#28a745"
        />
      ))}
    </svg>
  );
};

export default BarChart;
