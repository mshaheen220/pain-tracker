import React from 'react';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { getSeverityColor } from '../utils';

const TabularData = ({ data, onLogClick, selectedLogId }) => {
  if (!data || data.length === 0) {
    return (
      <div>
        <h3>Tabular Pain Data</h3>
        <p>No data available for the selected date range.</p>
      </div>
    );
  }

  // Get the date range from the data
  const dates = data.map(log => new Date(log.timestamp));
  const startDate = new Date(Math.min(...dates));
  const endDate = new Date(Math.max(...dates));
  const dateInterval = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });

  // Group data by body part
  const groupedData = data.reduce((acc, log) => {
    const bodyPart = log.location.bodyPart;
    if (!acc[bodyPart]) {
      acc[bodyPart] = {};
    }
    const day = format(new Date(log.timestamp), 'yyyy-MM-dd');
    acc[bodyPart][day] = log; // Store the whole log object
    return acc;
  }, {});

  return (
    <div>
      <h3>Tabular Pain Data</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="pain-table">
          <thead>
            <tr>
              <th>Body Part</th>
              {dateInterval.map(date => (
                <th key={date}>{format(date, 'MMM d')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([bodyPart, dayData]) => (
              <tr key={bodyPart}>
                <td>{bodyPart}</td>
                {dateInterval.map(date => {
                  const day = format(date, 'yyyy-MM-dd');
                  const log = dayData[day];
                  const isSelected = log && log.id === selectedLogId;

                  return (
                    <td 
                      key={day} 
                      onClick={() => log && onLogClick(log.id)}
                      className={`${isSelected ? 'selected' : ''} ${log ? 'clickable-cell' : ''}`}
                    >
                      {log ? (
                        <div
                          className="severity-cell"
                          style={{ backgroundColor: getSeverityColor(log.severity) }}
                        >
                          {log.severity}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabularData;
