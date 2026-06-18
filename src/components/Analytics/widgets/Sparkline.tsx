import React from 'react';

type Props = {width?: number; height?: number};

const Sparkline: React.FC<Props> = ({width = 300, height = 50}) => {
  const points = [5, 8, 4, 10, 7, 12, 9];
  const max = Math.max(...points);
  const step = width / (points.length - 1);
  const poly = points
    .map((p, i) => `${i * step},${height - (p / max) * height}`)
    .join(' ');

  return (
    <svg width={width} height={height} role="img" aria-label="Sparkline">
      <polyline fill="none" stroke="#ff7b72" strokeWidth={2} points={poly} />
    </svg>
  );
};

export default Sparkline;
