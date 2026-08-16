import React from 'react';

const PainTrend = ({ painLogs, bodyPart, side, specificLocation, entryDateTime }) => {
  const sevenDaysAgo = new Date(entryDateTime);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const relevantLogs = painLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return (
      log.location.bodyPart === bodyPart &&
      log.location.side === side &&
      log.location.specific === specificLocation &&
      logDate >= sevenDaysAgo
    );
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'green';
    if (severity <= 7) return 'orange';
    return 'red';
  };

  return (
    <>
      {relevantLogs.length > 0 ? (
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '5px' }}>
          {relevantLogs.map(log => (
            <div
              key={log.id}
              title={`Date: ${new Date(log.timestamp).toLocaleDateString()}, Severity: ${log.severity}`}
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                backgroundColor: getSeverityColor(log.severity),
              }}
            />
          ))}
        </div>
      ) : (
        <p style={{ margin: '5px 0 0', textAlign: 'center' }}>No recent entries for this location.</p>
      )}
    </>
  );
};

export default PainTrend;
