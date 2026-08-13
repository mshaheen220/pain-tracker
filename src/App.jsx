import React, { useState, useEffect, useMemo } from 'react';
import PainForm from './components/PainForm';
import HumanModel from './components/HumanModel';
import './App.css';
import Login from './components/Login';
import { supabase } from './supabaseClient';
import DateFilter from './components/DateFilter';
import PainLogList from './components/PainLogList';
import { getSeverityColor } from './utils';
import { useAuth } from './hooks/useAuth';
import { usePainLogContext } from './contexts/PainLogContext';

function App() {
  const [view, setView] = useState('model'); // 'model' or 'logs'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [hoveredPainId, setHoveredPainId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [focusedPainPoint, setFocusedPainPoint] = useState(null); // New state for focused point
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { painLogs, addPainLog, updatePainLog, deletePainLog } = usePainLogContext();
  const { session, profile } = useAuth();


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
      updatePainLog(logData);
    } else {
      addPainLog(logData);
    }
  };

  const handleDelete = (idToDelete) => {
    deletePainLog(idToDelete);
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
            <DateFilter
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              handleClearFilters={handleClearFilters}
            />
            <PainLogList
              logs={filteredPainLogs}
              setHoveredPainId={setHoveredPainId}
              setFocusedPainPoint={setFocusedPainPoint}
              handleEditClick={handleEditClick}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;

