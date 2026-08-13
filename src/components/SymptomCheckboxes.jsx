import React from 'react';

const SymptomCheckboxes = ({ isSwollen, setIsSwollen, isHotToTouch, setIsHotToTouch, isTenderToTouch, setIsTenderToTouch }) => {
  return (
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
  );
};

export default SymptomCheckboxes;
