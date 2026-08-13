import React from 'react';
import { bodyParts } from '../data/constants';

const LocationFields = ({ bodyPart, setBodyPart, side, setSide, specificLocation, setSpecificLocation }) => {
  return (
    <>
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
    </>
  );
};

export default LocationFields;
