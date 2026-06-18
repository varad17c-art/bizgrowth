import React from 'react';

const Drawer: React.FC = () => {
  return (
    <aside aria-label="Analytics details drawer" style={{marginTop: 20}}>
      <div className="drawer-header">
        <strong>Details</strong>
      </div>
      <div className="drawer-body">
        <p>Select a point in the charts to see details here.</p>
      </div>
    </aside>
  );
};

export default Drawer;
