import React from 'react';
import LineChart from './widgets/LineChart';
import BarChart from './widgets/BarChart';
import Sparkline from './widgets/Sparkline';

const DashboardSVG: React.FC = () => {
  return (
    <section aria-label="Analytics visualizations">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
        <div>
          <h3>Events over time</h3>
          <LineChart width={600} height={200} />
        </div>
        <div>
          <h3>Top categories</h3>
          <BarChart width={400} height={200} />
        </div>
        <div>
          <h3>Recent activity</h3>
          <Sparkline width={600} height={80} />
        </div>
      </div>
    </section>
  );
};

export default DashboardSVG;
