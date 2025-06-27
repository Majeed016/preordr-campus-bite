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
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching canteens:', error);
        return;
      }
      
      console.log('Raw canteens data from DB:', data);
      
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
      
      console.log('Transformed canteens:', transformedCanteens);
      setCanteens(transformedCanteens);
    } catch (error) {
      console.error('Error in refreshCanteens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadCanteens = async () => {
      if (isSubscribed) {
        await refreshCanteens();
      }
    };

    loadCanteens();

    // Poll for canteen updates every 10 seconds
    const interval = setInterval(() => {
      if (isSubscribed) {
        refreshCanteens();
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const selectCanteen = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
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
