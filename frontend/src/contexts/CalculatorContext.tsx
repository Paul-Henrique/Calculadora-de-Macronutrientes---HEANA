import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NutritionCalculationResponse } from '../types';
import { CalculatorFormData } from '../components/calculator/calculatorSchema';

interface CalculatorState {
  patientId: number | null;
  result: NutritionCalculationResponse | null;
  currentData: CalculatorFormData | null;
}

interface CalculatorContextType {
  calculatorState: CalculatorState;
  setCalculatorState: (patientId: number | null, state: Partial<CalculatorState>) => void;
  resetCalculatorState: () => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calculatorState, setCalculatorStateInternal] = useState<CalculatorState>(() => {
    const saved = localStorage.getItem('calculatorState');
    return saved ? JSON.parse(saved) : { patientId: null, result: null, currentData: null };
  });

  const setCalculatorState = React.useCallback((patientId: number | null, newState: Partial<CalculatorState>) => {
    setCalculatorStateInternal(prev => {
      const updated = { ...prev, ...newState, patientId };
      localStorage.setItem('calculatorState', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetCalculatorState = React.useCallback(() => {
    setCalculatorStateInternal({ patientId: null, result: null, currentData: null });
    localStorage.removeItem('calculatorState');
  }, []);

  const value = React.useMemo(() => ({
    calculatorState,
    setCalculatorState,
    resetCalculatorState
  }), [calculatorState, setCalculatorState, resetCalculatorState]);

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
