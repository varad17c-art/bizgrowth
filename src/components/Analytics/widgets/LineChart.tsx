import React from 'react';

type Props = {
  width?: number;
  height?: number;
};

const LineChart: React.FC<Props> = ({width = 600, height = 200}) => {
  // Minimal SVG skeleton for a line chart. Replace with real rendering later.
  return (
    <svg width={width} height={height} role="img" aria-label="Line chart">
      <rect width="100%" height="100%" fill="#f6f8fa" rx={4} />
      <polyline
        fill="none"
        stroke="#0366d6"
        strokeWidth={2}
        points={`${10},${height - 30} ${width / 3},${height / 2} ${(2 * width) / 3},${height / 3} ${width - 10},${height / 4}`}
      />
    </svg>
  );
};

export default LineChart;
