
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface AdminCanteen {
  id: string;
  name: string;
  location: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  accepting_orders: boolean;
}

interface AdminCanteenContextType {
  canteen: AdminCanteen | null;
  loading: boolean;
  toggleOrderAcceptance: () => Promise<void>;
  refreshCanteen: () => Promise<void>;
}

const AdminCanteenContext = createContext<AdminCanteenContextType | undefined>(undefined);

export const useAdminCanteen = () => {
  const context = useContext(AdminCanteenContext);
  if (context === undefined) {
    throw new Error('useAdminCanteen must be used within an AdminCanteenProvider');
  }
  return context;
};

interface AdminCanteenProviderProps {
  children: ReactNode;
}

export const AdminCanteenProvider = ({ children }: AdminCanteenProviderProps) => {
  const [canteen, setCanteen] = useState<AdminCanteen | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshCanteen = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .eq('admin_user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching canteen:', error);
        return;
      }
      
      // Transform the data to match our interface
      const canteenData: AdminCanteen = {
        id: data.id,
        name: data.name,
        location: data.location || '',
        description: data.description,
        image_url: data.image_url,
        is_active: data.is_active ?? true,
        accepting_orders: data.accepting_orders ?? true
      };
      
      setCanteen(canteenData);
    } catch (error) {
      console.error('Error in refreshCanteen:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderAcceptance = async () => {
    if (!canteen) return;

    try {
      const newStatus = !canteen.accepting_orders;
      
      const { error } = await supabase
        .from('canteens')
        .update({ accepting_orders: newStatus })
        .eq('id', canteen.id);
      
      if (error) {
        console.error('Error updating order acceptance:', error);
        toast.error('Failed to update order acceptance status');
        return;
      }
      
      setCanteen({ ...canteen, accepting_orders: newStatus });
      toast.success(
        newStatus 
          ? 'Now accepting orders' 
          : 'Orders are now paused'
      );
    } catch (error) {
      console.error('Error toggling order acceptance:', error);
      toast.error('Failed to update order acceptance status');
    }
  };

  useEffect(() => {
    refreshCanteen();
  }, [user]);

  const value = {
    canteen,
    loading,
    toggleOrderAcceptance,
    refreshCanteen
  };

  return (
    <AdminCanteenContext.Provider value={value}>
      {children}
    </AdminCanteenContext.Provider>
  );
};
