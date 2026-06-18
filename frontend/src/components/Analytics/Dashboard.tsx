import React from 'react';
import DashboardSVG from './DashboardSVG';
import Drawer from './Drawer';

const Dashboard: React.FC = () => {
  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      <DashboardSVG />
      <Drawer />
    </div>
  );
};

export default Dashboard;
