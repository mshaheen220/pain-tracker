import React, { useState, useEffect, useMemo } from 'react';
import PainForm from './components/PainForm';
import HumanModel from './components/HumanModel';
import './App.css';
import legacyPains from './assets/legacy_pains.json';
import improvedIcon from './assets/icons/trend_improved.png';
import intensifiedIcon from './assets/icons/trend_intensified.png';
import newIcon from './assets/icons/trend_new.png';
import unchangedIcon from './assets/icons/trend_unchanged.png';

const trendIcons = {
  improved: improvedIcon,
  intensified: intensifiedIcon,
  new: newIcon,
  unchanged: unchangedIcon,
};


const bodyParts = [
  "Head", "Neck", "Shoulder", "Arm", "Elbow", "Forearm", "Wrist", "Hand", "Finger",
  "Chest", "Upper Back", "Lower Back", "Abdomen", "Hip", "Thigh", "Knee",
  "Lower Leg", "Ankle", "Foot", "Toe"
];

function migrateLegacyEntry(entry) {
  const newEntry = { ...entry };
  const locationString = entry.location.bodyPart.toLowerCase();
  let side = 'center';
  let bodyPart = '';
  let specific = locationString;

  if (locationString.includes('left')) {
    side = 'left';
  } else if (locationString.includes('right')) {
    side = 'right';
  } else if (locationString.includes('both')) {
    side = 'center';
  }

  for (const part of bodyParts) {
    if (locationString.includes(part.toLowerCase())) {
      bodyPart = part;
      break;
    }
  }

  newEntry.location = { bodyPart, side, specific, coordinates: entry.location.coordinates };
  return newEntry;
}

function formatLocation(location) {
  const { bodyPart, side, specific } = location;
  let locationString = bodyPart || 'N/A';

  if (side && side !== 'center') {
    locationString += `, ${side.charAt(0).toUpperCase() + side.slice(1)}`;
  }
  if (specific && specific.toLowerCase() !== bodyPart.toLowerCase()) {
    locationString += ` (${specific})`;
  }
  return locationString;
}

function getSeverityColor(severity) {
  // Maps severity from 0-10 to a hue from 120 (green) to 0 (red).
  const hue = (10 - severity) * 12;
  // For low severity, we want it to be less saturated.
  const saturation = 70 + (severity * 3); // 70% to 100%
  const lightness = 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [hoveredPainId, setHoveredPainId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [focusedPainPoint, setFocusedPainPoint] = useState(null); // New state for focused point
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Initialize state from localStorage or an empty array
  const [painLogs, setPainLogs] = useState(() => {
    try {
      const savedLogs = localStorage.getItem('painLogs');
      if (savedLogs) {
        return JSON.parse(savedLogs);
      }
      // If no saved logs, migrate and use the legacy data
      const migratedPains = legacyPains.map(migrateLegacyEntry);
      const parsed = migratedPains || [];
      // Sort logs by timestamp once on initial load
      return parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Could not parse pain logs from localStorage", error);
      return [];
    }
  });

  // Save to localStorage whenever painLogs changes
  useEffect(() => {
    localStorage.setItem('painLogs', JSON.stringify(painLogs));
  }, [painLogs]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const filteredPainLogs = useMemo(() => {
    return painLogs.filter(log => {
      if (!startDate && !endDate) return true;
      
      const logDate = new Date(log.timestamp);
      
      // For date comparison, we want to ignore the time part.
      // Setting hours to 0 ensures we compare dates correctly.
      const start = startDate ? new Date(startDate) : null;
      if (start) start.setUTCHours(0, 0, 0, 0);

      const end = endDate ? new Date(endDate) : null;
      if (end) end.setUTCHours(23, 59, 59, 999);

      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });
  }, [painLogs, startDate, endDate]);

  const painPointsWithColor = useMemo(() => {
    return filteredPainLogs.map(log => ({
        ...log,
        color: getSeverityColor(log.severity)
    }));
  }, [filteredPainLogs]);

  const handleLogPain = (logData) => {
    if (editingEntry) {
      // Update existing entry
      setPainLogs(
        painLogs.map((log) => (log.id === editingEntry.id ? logData : log))
      );
    } else {
      // Add new entry
      setPainLogs(prevLogs => [logData, ...prevLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
  };

  const handleDelete = (idToDelete) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setPainLogs(prevLogs => prevLogs.filter(log => log.id !== idToDelete));
    }
  };

  const handleDeleteEntry = (idToDelete) => {
    handleDelete(idToDelete);
    onClose(); // Close form after deletion
  };

  const handleModelInteraction = (point) => {
    if (isFormOpen && editingEntry) {
      // If the form is open for editing, just update the coordinates for the current session.
      setClickedCoordinates(point);
    } else {
      // Otherwise, start a new entry.
      setEditingEntry(null);
      setClickedCoordinates(point);
      setIsFormOpen(true);
    }
  };

  const handleEditClick = (log) => {
    setEditingEntry(log);
    setClickedCoordinates(log.location.coordinates); // Also set coordinates for the marker
    setIsFormOpen(true);
  };

  const onClose = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
    setClickedCoordinates(null);
  };

  return (
    <div className="app-container">
      <div className="left-panel">
        <h1>Pain Tracker</h1>
        <HumanModel
          onPointClick={handleModelInteraction}
          clickedPoint={isFormOpen ? clickedCoordinates : null}
          hoveredPainId={hoveredPainId}
          focusedPainPoint={focusedPainPoint} // Pass focused point to HumanModel
          painPoints={painPointsWithColor}
        />
      </div>

      <div className="right-panel">
        {isFormOpen ? (
          <PainForm
            initialData={editingEntry}
            initialCoordinates={clickedCoordinates}
            onClose={onClose}
            onLogPain={handleLogPain}
            onDelete={handleDelete}
          />
        ) : (
          <>
            <div className="filter-container">
              <div className="date-filters">
                <div className="form-group">
                  <label htmlFor="startDate">From</label>
                  <input type="date" id="startDate" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">To</label>
                  <input type="date" id="endDate" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              {(startDate || endDate) &&
                <button onClick={handleClearFilters} className="clear-filter-button">Reset Dates</button>
              }
            </div>
            <div className="pain-logs-container">
              {filteredPainLogs.length === 0 ? (
                <p>No pain logged yet.</p>
              ) : (
                <ul>
                  {/* Render the filtered list */}
                  {filteredPainLogs.map((log) => (
                    <li
                      key={log.id}
                      className="pain-log-item"
                      style={{ borderLeftColor: getSeverityColor(log.severity) }} // Keep severity color
                      onMouseEnter={() => {
                        setHoveredPainId(log.id);
                        setFocusedPainPoint(log); // Set focused point on hover
                      }}
                      onMouseLeave={() => {
                        setHoveredPainId(null);
                        setFocusedPainPoint(null); // Clear focused point on leave
                      }}
                      onClick={() => handleEditClick(log)}>
                      <div className="pain-log-header">
                        <strong>{formatLocation(log.location)}</strong>
                        <div className="pain-log-header-right">
                          {log.trend && trendIcons[log.trend] && (
                            <img
                              src={trendIcons[log.trend]}
                              alt={log.trend}
                              title={log.trend}
                              className="trend-icon"
                            />
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
