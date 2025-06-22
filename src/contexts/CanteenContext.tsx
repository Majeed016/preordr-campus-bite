
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Canteen {
  id: string;
  name: string;
  location: string;
  admin_user_id?: string;
}

interface CanteenContextType {
  selectedCanteen: Canteen | null;
  canteens: Canteen[];
  selectCanteen: (canteen: Canteen) => void;
  clearCanteen: () => void;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (context === undefined) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};

interface CanteenProviderProps {
  children: ReactNode;
}

// Mock canteens data
const mockCanteens: Canteen[] = [
  { id: '1', name: 'Main Campus Cafeteria', location: 'Building A, Ground Floor' },
  { id: '2', name: 'Engineering Block Canteen', location: 'Engineering Block, 2nd Floor' },
  { id: '3', name: 'Library Food Court', location: 'Central Library, Basement' },
  { id: '4', name: 'Sports Complex Cafe', location: 'Sports Complex, Ground Floor' },
];

export const CanteenProvider = ({ children }: CanteenProviderProps) => {
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [canteens] = useState<Canteen[]>(mockCanteens);

  useEffect(() => {
    // Check if canteen is selected (from localStorage)
    const storedCanteen = localStorage.getItem('selected_canteen');
    if (storedCanteen) {
      setSelectedCanteen(JSON.parse(storedCanteen));
    }
  }, []);

  const selectCanteen = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
    localStorage.setItem('selected_canteen', JSON.stringify(canteen));
  };

  const clearCanteen = () => {
    setSelectedCanteen(null);
    localStorage.removeItem('selected_canteen');
  };

  const value = {
    selectedCanteen,
    canteens,
    selectCanteen,
    clearCanteen
  };

  return (
    <CanteenContext.Provider value={value}>
      {children}
    </CanteenContext.Provider>
  );
};
