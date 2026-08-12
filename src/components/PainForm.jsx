import React, { useState, useEffect } from 'react';

/**
 * A form component for users to log their pain.
 *
 * @param {object} props - The component's props.
 * @param {function} props.onClose - Callback function to cancel and close the form.
 * @param {function} props.onLogPain - Callback function to execute when the form is submitted.
 *                                     It receives an object with pain data.
 * @param {function} props.onDelete - Callback function to delete the current entry.
 * @param {object} [props.initialData] - The initial data to populate the form for editing.
 * @param {object} [props.initialCoordinates] - The initial coordinates for the pain location.
 */
const bodyParts = [
  "Head", "Neck", "Shoulder", "Arm", "Elbow", "Forearm", "Wrist", "Hand", "Finger",
  "Chest", "Upper Back", "Lower Back", "Abdomen", "Hip", "Thigh", "Knee",
  "Lower Leg", "Ankle", "Foot", "Toe"
];

const PainForm = ({ onClose, onLogPain, onDelete, initialData, initialCoordinates }) => {
  const [severity, setSeverity] = useState(5); // Renamed from painLevel
  const [bodyPart, setBodyPart] = useState('');
  const [side, setSide] = useState('center'); // 'left', 'right', 'center'
  const [specificLocation, setSpecificLocation] = useState(''); // New state for specific location
  const [isSwollen, setIsSwollen] = useState(false);
  const [isHotToTouch, setIsHotToTouch] = useState(false);
  const [isTenderToTouch, setIsTenderToTouch] = useState(false);
  const [trend, setTrend] = useState('');
  const [notes, setNotes] = useState(''); // Renamed from description

  useEffect(() => {
    if (initialData) {
      setSeverity(initialData.severity);
      setBodyPart(initialData.location.bodyPart);
      setSide(initialData.location.side);
      setSpecificLocation(initialData.location.specific);
      setIsSwollen(initialData.isSwollen);
      setIsHotToTouch(initialData.isHotToTouch);
      setIsTenderToTouch(initialData.isTenderToTouch);
      setTrend(initialData.trend);
      setNotes(initialData.notes);
    }
  }, [initialData]);

  const isEditing = !!initialData;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!bodyPart) {
      alert('Please specify the location of the pain.');
      return;
    }

    const logData = {
      id: isEditing ? initialData.id : `entry-${Date.now()}`,
      timestamp: isEditing ? initialData.timestamp : new Date().toISOString(),
      location: {
        bodyPart: bodyPart,
        side: side,
        specific: specificLocation,
        coordinates: initialCoordinates || (isEditing ? initialData.location.coordinates : null),
      },
      severity: Number(severity),
      isSwollen,
      isHotToTouch,
      isTenderToTouch,
      trend: trend || 'unchanged', // Default to 'unchanged' if no trend is selected
      notes,
    };

    onLogPain(logData);

    // Reset form fields to their initial state after submission
    setSeverity(5);
    setBodyPart('');
    setSide('center');
    setSpecificLocation('');
    setIsSwollen(false);
    setIsHotToTouch(false);
    setIsTenderToTouch(false);
    setTrend('');
    setNotes('');
    onClose(); // Close the modal after submission
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(initialData.id);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pain-form">
      <h2>{isEditing ? 'Edit Pain Entry' : 'Log Your Pain'}</h2>
      {isEditing && (
        <p style={{ fontSize: '0.9rem', color: '#a0aec0', margin: '-0.5rem 0 0.5rem' }}>
          Click on the model to update the pain location.
        </p>
      )}
      <div className="form-group">
        <label htmlFor="severity">Severity: {severity}</label>
        <input
          id="severity"
          type="range"
          min="0"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="form-range"
        />
      </div>
      <div className="form-group">
        <label htmlFor="bodyPart">Body Part:</label>
        <select id="bodyPart" className="form-select" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} required>
          <option value="">Select a body part</option>
          {bodyParts.map(part => <option key={part} value={part}>{part}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="side">Side:</label>
        <select id="side" className="form-select" value={side} onChange={(e) => setSide(e.target.value)}>
          <option value="center">Center / Both</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="specificLocation">Specific Location (optional):</label>
        <input id="specificLocation" className="form-input" type="text" value={specificLocation} onChange={(e) => setSpecificLocation(e.target.value)} placeholder="e.g., Middle knuckle" />
      </div>
      <div className="form-group-checkboxes">
        <div className="checkbox-group">
          <input type="checkbox" id="isSwollen" checked={isSwollen} onChange={(e) => setIsSwollen(e.target.checked)} />
          <label htmlFor="isSwollen">Swollen</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="isHotToTouch" checked={isHotToTouch} onChange={(e) => setIsHotToTouch(e.target.checked)} />
          <label htmlFor="isHotToTouch">Hot to Touch</label>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="isTenderToTouch" checked={isTenderToTouch} onChange={(e) => setIsTenderToTouch(e.target.checked)} />
          <label htmlFor="isTenderToTouch">Tender to Touch</label>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="trend">Trend:</label>
        <select id="trend" className="form-select" value={trend} onChange={(e) => setTrend(e.target.value)}>
          <option value="">Select Trend</option>
          <option value="improved">Improved</option>
          <option value="intensified">Intensified</option>
          <option value="unchanged">Unchanged</option>
          <option value="new">New</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes (optional):</label>
        <textarea id="notes" className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Sharp pain after sitting for extended periods." />
      </div>
      <div className="form-actions">
        {isEditing && (
          <button type="button" onClick={handleDelete} className="delete-entry-button">
            Delete
          </button>
        )}
        <button type="button" onClick={onClose} className="add-pain-button" style={{ backgroundColor: '#4b5563' }}>
          Cancel
        </button>
        <button type="submit" className="add-pain-button">
          {isEditing ? 'Save Changes' : 'Log Pain'}
        </button>
      </div>
    </form>
  );
};

export default PainForm;
