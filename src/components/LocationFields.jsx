import React, { useState, useEffect } from 'react';
import bodyPartHierarchy from '/public/body_parts.json';

const LocationFields = ({ bodyPart, setBodyPart, side, setSide, specificLocation, setSpecificLocation, disabled }) => {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedBasicPartId, setSelectedBasicPartId] = useState('');

  useEffect(() => {
    if (disabled) {
      setSelectedRegionId('');
      setSelectedBasicPartId('');
      return;
    }
    if (bodyPartHierarchy.length > 0 && bodyPart) {
      for (const region of bodyPartHierarchy) {
        const foundPart = region.basicParts.find(p => p.name === bodyPart);
        if (foundPart) {
          setSelectedRegionId(region.id);
          setSelectedBasicPartId(foundPart.id);
          break;
        }
      }
    }
  }, [bodyPart, disabled]);

  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    setSelectedRegionId(regionId);
    setSelectedBasicPartId('');
    setBodyPart('');
    setSide('');
    setSpecificLocation('');
  };

  const handleBasicPartChange = (e) => {
    const partId = e.target.value;
    setSelectedBasicPartId(partId);
    const region = bodyPartHierarchy.find(r => r.id === selectedRegionId);
    const basicPart = region?.basicParts.find(p => p.id === partId);
    setBodyPart(basicPart ? basicPart.name : '');
    const firstAllowedSide = basicPart?.allowedSides?.[0] || '';
    setSide(firstAllowedSide.toLowerCase());
    setSpecificLocation('');
  };

  const selectedRegion = bodyPartHierarchy.find(r => r.id === selectedRegionId);
  const selectedBasicPart = selectedRegion?.basicParts.find(p => p.id === selectedBasicPartId);

  return (
    <>
      <div className="form-group">
        <label htmlFor="region">Region:</label>
        <select id="region" className="form-select" value={selectedRegionId} onChange={handleRegionChange} required disabled={disabled}>
          <option value="">Select a region</option>
          {bodyPartHierarchy.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
        </select>
      </div>

      {selectedRegionId && (
        <div className="form-group">
          <label htmlFor="bodyPart">Body Part:</label>
          <select id="bodyPart" className="form-select" value={selectedBasicPartId} onChange={handleBasicPartChange} required disabled={disabled}>
            <option value="">Select a body part</option>
            {selectedRegion?.basicParts.map(part => <option key={part.id} value={part.id}>{part.name}</option>)}
          </select>
        </div>
      )}

      {selectedBasicPartId && selectedBasicPart && selectedBasicPart.allowedSides && (
        <>
          <div className="form-group">
            <label htmlFor="side">Side:</label>
            <select id="side" className="form-select" value={side} onChange={(e) => setSide(e.target.value)} required disabled={disabled}>
              {selectedBasicPart.allowedSides.map(s => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="specificLocation">Specific Location:</label>
            <select id="specificLocation" className="form-select" value={specificLocation} onChange={(e) => setSpecificLocation(e.target.value)} required disabled={disabled}>
                <option value="">Select a specific location</option>
                {selectedBasicPart?.specificParts?.map(part => (
                    <option key={part} value={part}>{part}</option>
                ))}
            </select>
          </div>
        </>
      )}
    </>
  );
};

export default LocationFields;
