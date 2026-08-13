import React, { useState, useEffect, useMemo } from 'react';
import PainForm from './components/PainForm';
import HumanModel from './components/HumanModel';
import './App.css';
import Login from './components/Login';
import { supabase } from './supabaseClient';
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
  const [view, setView] = useState('model'); // 'model' or 'logs'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [hoveredPainId, setHoveredPainId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [focusedPainPoint, setFocusedPainPoint] = useState(null); // New state for focused point
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Initialize state from localStorage or an empty array
  const [painLogs, setPainLogs] = useState(() => {
    // Initial state is empty, data will be fetched from Supabase
    return [];
  });

  // Handle auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when session changes
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) console.error('Error fetching profile:', profileError);
      else setProfile(profileData);

      // Fetch pain logs
      const { data: logsData, error: logsError } = await supabase
        .from('pain_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (logsError) console.error('Error fetching pain logs:', logsError);
      else setPainLogs(logsData || []);
    };

    fetchData();
  }, [session]);

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
    const upsertPainLog = async () => {
      let error = null;
      if (editingEntry) {
        // Update existing entry in Supabase
        const { error: updateError } = await supabase
          .from('pain_entries')
          .update(logData)
          .eq('id', logData.id);
        error = updateError;
      } else {
        // Add new entry to Supabase
        const { error: insertError } = await supabase
          .from('pain_entries')
          .insert(logData);
        error = insertError;
      }

      if (error) {
        console.error('Error saving pain log:', error);
      } else {
        // Re-fetch all logs to update the UI after a successful upsert
        const { data } = await supabase.from('pain_entries').select('*').order('timestamp', { ascending: false });
        setPainLogs(data || []);
      }
    }
    upsertPainLog();
  };

  const handleDelete = (idToDelete) => {
    const deletePainLog = async () => {
      if (window.confirm('Are you sure you want to delete this entry?')) {
        const { error } = await supabase
          .from('pain_entries')
          .delete()
          .eq('id', idToDelete);

        if (error) {
          console.error('Error deleting pain log:', error);
        } else {
          // Re-fetch all logs to update the UI after a successful delete
          const { data } = await supabase.from('pain_entries').select('*').order('timestamp', { ascending: false });
          setPainLogs(data || []);
        }
      }
    };
    deletePainLog();
  };

  const handleDeleteEntry = (idToDelete) => {
    handleDelete(idToDelete);
    onClose(); // Close form after deletion
  };

  const handleModelInteraction = (point) => {
    // Only allow model interaction for admins
    if (profile?.role !== 'admin') return;

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
    // Only allow editing for admins
    if (profile?.role !== 'admin') return;

    setEditingEntry(log);
    setClickedCoordinates(log.location.coordinates); // Also set coordinates for the marker
    setIsFormOpen(true);
  };

  const onClose = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
    setClickedCoordinates(null);
  };

  if (!session) {
    return <Login />;
  }

  return (
    <div className={`app-container view-${view}`}>
      <div className="mobile-nav">
        <button
          className={`mobile-nav-button ${view === 'model' ? 'active' : ''}`}
          onClick={() => setView('model')}>
          Model
        </button>
        <button
          className={`mobile-nav-button ${view === 'logs' ? 'active' : ''}`}
          onClick={() => setView('logs')}>
          Logs
        </button>
      </div>
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
      <button
        onClick={() => supabase.auth.signOut()}
        className="logout-button"
        style={{ position: 'absolute', top: '2.5rem', right: '2.5rem' }}>
        Sign Out
      </button>

      <div className={`right-panel ${isFormOpen ? 'form-open' : ''}`}>
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
            <div className="filter-container" style={{ marginTop: '1.5rem' }}>
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
              <h2>My Pain Logs</h2>
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
