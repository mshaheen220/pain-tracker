import React, { useState, useEffect, useMemo } from 'react';
import PainForm from './components/PainForm';
import HumanModel from './components/HumanModel';
import './App.css';
import Login from './components/Login';
import { supabase } from './supabaseClient';
import DateFilter from './components/DateFilter';
import PainLogList from './components/PainLogList';
import TabularData from './components/TabularData';
import Snapshots from './components/Snapshots';
import { getSeverityColor } from './utils';
import { useAuth } from './hooks/useAuth';
import { usePainLogContext } from './contexts/PainLogContext';
import packageJson from '../package.json';
import { GLOBAL_PAIN_TYPES } from './data/constants';

function App() {
  const packageVersion = packageJson.version;
  const [view, setView] = useState('3d-model'); // '3d-model', 'tabular-data', or 'snapshots'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [hoveredPainId, setHoveredPainId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [focusedPainPoint, setFocusedPainPoint] = useState(null); // New state for focused point

  // Calculate today's date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;

  // Calculate date 7 days ago
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoYear = sevenDaysAgo.getFullYear();
  const sevenDaysAgoMonth = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
  const sevenDaysAgoDay = String(sevenDaysAgo.getDate()).padStart(2, '0');
  const formattedSevenDaysAgo = `${sevenDaysAgoYear}-${sevenDaysAgoMonth}-${sevenDaysAgoDay}`;

  const [startDate, setStartDate] = useState(formattedSevenDaysAgo);
  const [endDate, setEndDate] = useState(formattedToday);
  const [selectedLogId, setSelectedLogId] = useState(null); // For tabular data selection
  const [showOnlyGlobal, setShowOnlyGlobal] = useState(false);
  const { painLogs, addPainLog, updatePainLog, deletePainLog } = usePainLogContext();
  const { session, profile } = useAuth();

  useEffect(() => {
    // Reset selected log when date range changes
    setSelectedLogId(null);
  }, [startDate, endDate]);

  const handleClearFilters = () => {
    setStartDate(formattedSevenDaysAgo);
    setEndDate(formattedToday);
    setSelectedLogId(null);
    setShowOnlyGlobal(false);
  };

  const handleShowGlobal = () => {
    setShowOnlyGlobal(true);
    setSelectedLogId(null);
  };

  const filteredPainLogs = useMemo(() => {
    let logs = painLogs.filter(log => {
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

    if (showOnlyGlobal) {
      return logs.filter(log => GLOBAL_PAIN_TYPES.includes(log.location.bodyPart));
    }

    return logs;
  }, [painLogs, startDate, endDate, showOnlyGlobal]);

  const displayedLogs = useMemo(() => {
    if (selectedLogId) {
      return filteredPainLogs.filter(log => log.id === selectedLogId);
    }
    return filteredPainLogs;
  }, [filteredPainLogs, selectedLogId]);

  const painPointsWithColor = useMemo(() => {
    // Filter out global logs from being displayed on the 3D model
    return filteredPainLogs
      .filter(log => !GLOBAL_PAIN_TYPES.includes(log.location.bodyPart))
      .map(log => ({
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
    setClickedCoordinates(GLOBAL_PAIN_TYPES.includes(log.location.bodyPart) ? null : log.location.coordinates); // Also set coordinates for the marker
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

  const renderRightPanel = () => {
    if (isFormOpen) {
      return (
        <PainForm
          initialData={editingEntry}
          initialCoordinates={clickedCoordinates}
          onClose={onClose}
          onLogPain={handleLogPain}
          onDelete={handleDelete}
        />
      );
    }

    return (
      <>
        <DateFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          handleClearFilters={handleClearFilters}
        />
        {(selectedLogId || showOnlyGlobal) && (
          <button 
            className="clear-selection-button"
            onClick={handleClearFilters}
          >
            Clear Selection
          </button>
        )}
        <PainLogList
          logs={displayedLogs}
          allLogsForPeriod={filteredPainLogs}
          setHoveredPainId={setHoveredPainId}
          setFocusedPainPoint={setFocusedPainPoint}
          handleEditClick={handleEditClick}
          onShowGlobal={handleShowGlobal}
        />
      </>
    );
  }

  return (
    <div className={`app-container view-${view}`}>
      <div className="main-content">
        <div className={`panels-container ${view === '3d-model' ? 'align-panels-center' : ''}`}>
          <div className="left-panel">
            <div className="desktop-nav">
              <button
                className={`desktop-nav-button ${view === '3d-model' ? 'active' : ''}`}
                onClick={() => setView('3d-model')}>
                3D Model
              </button>
              <button
                className={`desktop-nav-button ${view === 'tabular-data' ? 'active' : ''}`}
                onClick={() => setView('tabular-data')}>
                Tabular Data
              </button>
              {/* <button
                className={`desktop-nav-button ${view === 'snapshots' ? 'active' : ''}`}
                onClick={() => setView('snapshots')}>
                Snapshots
              </button> */}
            </div>
            <h1>Pain Tracker</h1>
            {view === '3d-model' && (
              <HumanModel
                onPointClick={handleModelInteraction}
                clickedPoint={isFormOpen ? clickedCoordinates : null}
                hoveredPainId={hoveredPainId}
                focusedPainPoint={focusedPainPoint} // Pass focused point to HumanModel
                painPoints={painPointsWithColor}
              />
            )}
            {view === 'tabular-data' && (
              <TabularData
                data={filteredPainLogs}
                onLogClick={setSelectedLogId}
                selectedLogId={selectedLogId}
              />
            )}
            {view === 'snapshots' && (
              <Snapshots logs={filteredPainLogs} />
            )}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="logout-button"
            style={{ position: 'absolute', top: '2.5rem', right: '2.5rem' }}>
            Sign Out
          </button>

          <div className={`right-panel ${isFormOpen ? 'form-open' : ''} ${view === 'tabular-data' ? 'full-height-panel' : ''}`}>
            {renderRightPanel()}
          </div>
        </div>
      </div> {/* End of main-content */}
      <footer className="app-footer">
        <p>
          &copy; 2026 <a href="https://github.com/mshaheen220/pain-tracker" target="_blank" rel="noopener noreferrer">Michael Shaheen</a>. Version {packageVersion}.{' '}
        </p>
      </footer>
    </div>
  );
}

export default App;

