import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { getSeverityColor } from '../utils';

const TabularData = ({ data, onLogClick, selectedLogId }) => {
  const [bodyPartMap, setBodyPartMap] = useState(null);

  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        const response = await fetch('/pain-tracker/body_parts.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bodyPartsData = await response.json();
        const partMap = {};
        bodyPartsData.forEach(group => {
          group.basicParts.forEach(part => {
            // Key by the more descriptive name for easier lookup
            partMap[part.name] = {
              name: part.name,
              group: group.name,
            };
          });
        });
        setBodyPartMap(partMap);
      } catch (error) {
        console.error("Failed to fetch body parts:", error);
      }
    };

    fetchBodyParts();
  }, []);

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

  const formatFullLocationName = (location) => {
    if (!bodyPartMap) return '';
    
    // Handle legacy data that might use generic names
    const legacyNameMap = {
      "Finger": "Index Finger",
      "Toe": "Big Toe",
      "Hand": "Hand Body & Palm",
    };
    let partName = location.bodyPart;
    if (legacyNameMap[partName]) {
      partName = legacyNameMap[partName];
    }
    
    const partInfo = bodyPartMap[partName];
    const displayName = partInfo ? partInfo.name : location.bodyPart;

    let name = displayName;
    if (location.side && location.side !== 'Center' && location.side !== 'center') {
      name = `${location.side.charAt(0).toUpperCase() + location.side.slice(1)} ${name}`;
    }
    if (location.specific) {
      name += ` (${location.specific})`;
    }
    return name;
  };

  const groupedData = data.reduce((acc, log) => {
    const { location } = log;
    if (!bodyPartMap || !location || !location.bodyPart) {
      return acc;
    }

    const legacyNameMap = {
      "Finger": "Index Finger",
      "Toe": "Big Toe",
      "Hand": "Hand Body & Palm",
    };
    let bodyPartName = location.bodyPart;
    if (legacyNameMap[bodyPartName]) {
      bodyPartName = legacyNameMap[bodyPartName];
    }
  
    const partInfo = bodyPartMap[bodyPartName];
    if (!partInfo) {
      console.warn(`No part info found for bodyPart: ${location.bodyPart}`);
      return acc;
    }
  
    const groupName = partInfo.group;
    if (!acc[groupName]) {
      acc[groupName] = {};
    }
  
    const locationKey = `${location.bodyPart}-${location.side || ''}-${location.specific || ''}`;
  
    if (!acc[groupName][locationKey]) {
      acc[groupName][locationKey] = {
        location: log.location,
        logsByDay: {},
      };
    }
  
    const day = format(new Date(log.timestamp), 'yyyy-MM-dd');
    acc[groupName][locationKey].logsByDay[day] = log;
    return acc;
  }, {});

  if (!bodyPartMap) {
    return (
      <div>
        <h3>Tabular Pain Data</h3>
        <p>Loading body part data...</p>
      </div>
    );
  }
  
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
            {Object.keys(groupedData).sort().map(groupName => (
              <React.Fragment key={groupName}>
                <tr>
                  <th colSpan={dateInterval.length + 1} className="group-header">
                    {groupName}
                  </th>
                </tr>
                {Object.keys(groupedData[groupName]).sort((a, b) => formatFullLocationName(groupedData[groupName][a].location).localeCompare(formatFullLocationName(groupedData[groupName][b].location))).map(locationKey => {
                  const locationData = groupedData[groupName][locationKey];
                  const { location, logsByDay } = locationData;
                  return (
                    <tr key={locationKey}>
                      <td>{formatFullLocationName(location)}</td>
                      {dateInterval.map(date => {
                        const day = format(date, 'yyyy-MM-dd');
                        const log = logsByDay[day];
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
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabularData;
