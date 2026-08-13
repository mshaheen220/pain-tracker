import React from 'react';

const DateFilter = ({ startDate, setStartDate, endDate, setEndDate, handleClearFilters }) => {
  return (
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
  );
};

export default DateFilter;
