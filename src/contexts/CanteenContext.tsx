
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Canteen {
  id: string;
  name: string;
  location: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  accepting_orders?: boolean;
}

interface CanteenContextType {
  canteens: Canteen[];
  selectedCanteen: Canteen | null;
  loading: boolean;
  selectCanteen: (canteen: Canteen) => void;
  refreshCanteens: () => Promise<void>;
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

export const CanteenProvider = ({ children }: CanteenProviderProps) => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCanteens = async () => {
    try {
      console.log('Fetching canteens...');
      const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching canteens:', error);
        return;
      }
      
      console.log('Canteens fetched:', data);
      
      // Transform data to match our interface
      const transformedCanteens = data?.map(canteen => ({
        id: canteen.id,
        name: canteen.name,
        location: canteen.location || '',
        description: canteen.description,
        image_url: canteen.image_url,
        is_active: canteen.is_active ?? true,
        accepting_orders: canteen.accepting_orders ?? true
      })) || [];
      
      setCanteens(transformedCanteens);
    } catch (error) {
      console.error('Error in refreshCanteens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCanteens();
    
    // Check for previously selected canteen
    const storedCanteen = localStorage.getItem('selected_canteen');
    if (storedCanteen) {
      try {
        const parsed = JSON.parse(storedCanteen);
        setSelectedCanteen(parsed);
      } catch (error) {
        console.error('Error parsing stored canteen:', error);
        localStorage.removeItem('selected_canteen');
      }
    }
  }, []);

  const selectCanteen = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
    localStorage.setItem('selected_canteen', JSON.stringify(canteen));
    console.log('Canteen selected:', canteen.name);
  };

  const value = {
    canteens,
    selectedCanteen,
    loading,
    selectCanteen,
    refreshCanteens
  };

  return (
    <CanteenContext.Provider value={value}>
      {children}
    </CanteenContext.Provider>
  );
};
