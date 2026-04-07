import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient } from '../types';

interface PatientContextType {
  selectedPatient: Patient | null;
  selectPatient: (patient: Patient | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const saved = localStorage.getItem('selectedPatient');
    return saved ? JSON.parse(saved) : null;
  });

  const selectPatient = (patient: Patient | null) => {
    setSelectedPatient(patient);
    if (patient) {
      localStorage.setItem('selectedPatient', JSON.stringify(patient));
    } else {
      localStorage.removeItem('selectedPatient');
    }
  };

  return (
    <PatientContext.Provider value={{ selectedPatient, selectPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
