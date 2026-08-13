import React, { useMemo } from 'react';
import { format, startOfDay } from 'date-fns';

const Snapshots = ({ logs }) => {
  const snapshotsByDay = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {};
    }
    return logs.reduce((acc, log) => {
      const day = format(startOfDay(new Date(log.timestamp)), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(log);
      return acc;
    }, {});
  }, [logs]);

  return (
    <div>
      <h2>Pain Snapshots</h2>
      <p>This feature is under development. It will allow you to view and compare pain snapshots over time.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {Object.entries(snapshotsByDay).map(([day, dayLogs]) => (
          <div key={day} style={{ border: '1px solid #4a5568', padding: '0.5rem', borderRadius: '8px' }}>
            <h3>{format(new Date(day), 'MMM d')}</h3>
            <div style={{ width: '100%', height: '250px', backgroundColor: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem', borderRadius: '4px' }}>
              Snapshot
            </div>
          </div>
        ))}
      </div>
      {Object.keys(snapshotsByDay).length === 0 && (
        <p>No snapshots available for the selected date range.</p>
      )}
    </div>
  );
};

export default Snapshots;
