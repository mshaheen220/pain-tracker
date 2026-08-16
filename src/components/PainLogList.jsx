import React from 'react';
import improvedIcon from '../assets/icons/trend_improved.png';
import intensifiedIcon from '../assets/icons/trend_intensified.png';
import newIcon from '../assets/icons/trend_new.png';
import unchangedIcon from '../assets/icons/trend_unchanged.png';
import { formatLocation, getSeverityColor } from '../utils';
import { GLOBAL_PAIN_TYPES } from '../data/constants';

const trendIcons = {
  improved: improvedIcon,
  intensified: intensifiedIcon,
  new: newIcon,
  unchanged: unchangedIcon,
};

const PainLogList = ({ logs, allLogsForPeriod, setHoveredPainId, setFocusedPainPoint, handleEditClick, onShowGlobal }) => {
  const globalLogsForPeriodCount = allLogsForPeriod.filter(log => GLOBAL_PAIN_TYPES.includes(log.location.bodyPart)).length;
  const globalLogs = logs.filter(log => GLOBAL_PAIN_TYPES.includes(log.location.bodyPart));
  const specificLogs = logs.filter(log => !GLOBAL_PAIN_TYPES.includes(log.location.bodyPart));

  const logsToRender = specificLogs.length > 0 ? specificLogs : globalLogs;

  return (
    <div className="pain-logs-container">
      <h2>My Pain Logs</h2>
      {logs.length === 0 && globalLogsForPeriodCount === 0 ? (
        <p>No pain logged yet.</p>
      ) : (
        <ul>
          {globalLogsForPeriodCount > 0 && (
            <li className="pain-log-item global-notes-header" onClick={onShowGlobal}>
              <div className="pain-log-header">
                <strong>
                  <span className="global-notes-icon">🌍</span> Global Notes
                </strong>
                <span className="global-notes-count">{globalLogsForPeriodCount}</span>
              </div>
            </li>
          )}
          {logsToRender.map(log => (
            <li
              key={log.id}
              className="pain-log-item"
              style={{ borderLeftColor: getSeverityColor(log.severity) }}
              onMouseEnter={() => {
                if (!GLOBAL_PAIN_TYPES.includes(log.location.bodyPart)) {
                  setHoveredPainId(log.id);
                  setFocusedPainPoint(log);
                }
              }}
              onMouseLeave={() => {
                if (!GLOBAL_PAIN_TYPES.includes(log.location.bodyPart)) {
                  setHoveredPainId(null);
                  setFocusedPainPoint(null);
                }
              }}
              onClick={() => handleEditClick(log)}
            >
              <div className="pain-log-header">
                <strong>{formatLocation(log.location)}</strong>
                <div className="pain-log-header-right">
                  {log.trend && trendIcons[log.trend] && (
                    <img src={trendIcons[log.trend]} alt={log.trend} title={log.trend} className="trend-icon" />
                  )}
                  <span className="severity-pill" style={{ backgroundColor: getSeverityColor(log.severity) }}>
                    {log.severity}
                  </span>
                </div>
              </div>
              <div className="pain-log-details">
                <small>{new Date(log.timestamp).toLocaleString()}</small>
                {log.notes && <p>Notes: {log.notes}</p>}
                <div className="pain-log-tags">
                  {log.isSwollen && <span className="tag">Swollen</span>}
                  {log.isHotToTouch && <span className="tag">Hot</span>}
                  {log.isTenderToTouch && <span className="tag">Tender</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PainLogList;
