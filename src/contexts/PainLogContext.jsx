import React, { createContext, useContext } from 'react';
import { usePainLogs } from '../hooks/usePainLogs';

const PainLogContext = createContext();

export const PainLogProvider = ({ children }) => {
  const painLogs = usePainLogs();
  return (
    <PainLogContext.Provider value={painLogs}>
      {children}
    </PainLogContext.Provider>
  );
};

export const usePainLogContext = () => {
  return useContext(PainLogContext);
};
