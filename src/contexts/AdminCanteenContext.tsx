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

interface OrderStats {
  todayOrders: number;
  todayRevenue: number;
  platformFees: number;
  pendingOrders: number;
}

interface AdminCanteenContextType {
  canteen: AdminCanteen | null;
  stats: OrderStats;
  loading: boolean;
  toggleOrderAcceptance: () => Promise<void>;
  refreshCanteen: () => Promise<void>;
  refreshStats: () => Promise<void>;
  createCanteen: (canteenData: { name: string; location?: string; description?: string; image_url?: string }) => Promise<void>;
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
  const [stats, setStats] = useState<OrderStats>({
    todayOrders: 0,
    todayRevenue: 0,
    platformFees: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshCanteen = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching admin canteen for user:', user.id);
      
      const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .eq('admin_user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching admin canteen:', error);
        if (error.code === 'PGRST116') {
          console.log('No canteen found for admin user');
          setCanteen(null);
        }
        return;
      }
      
      console.log('Admin canteen data:', data);
      
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

  const refreshStats = async () => {
    if (!canteen) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's orders
      const { data: todayOrdersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, platform_fee, status')
        .eq('canteen_id', canteen.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      const todayOrders = todayOrdersData?.length || 0;
      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const platformFees = todayOrdersData?.reduce((sum, order) => sum + Number(order.platform_fee), 0) || 0;
      const pendingOrders = todayOrdersData?.filter(order => order.status === 'pending').length || 0;

      setStats({
        todayOrders,
        todayRevenue,
        platformFees,
        pendingOrders
      });
    } catch (error) {
      console.error('Error in refreshStats:', error);
    }
  };

  const toggleOrderAcceptance = async () => {
    if (!canteen) return;

    try {
      const newStatus = !canteen.accepting_orders;
      console.log('Toggling order acceptance to:', newStatus);
      
      const { error } = await supabase
        .from('canteens')
        .update({ accepting_orders: newStatus })
        .eq('id', canteen.id);
      
      if (error) {
        console.error('Error updating order acceptance:', error);
        toast.error('Failed to update order acceptance status');
        return;
      }
      
      // Update local state immediately
      setCanteen({ ...canteen, accepting_orders: newStatus });
      
      // Also trigger a broadcast to update other contexts
      const channel = supabase.channel('canteen-updates');
      channel.send({
        type: 'broadcast',
        event: 'canteen_status_changed',
        payload: { canteen_id: canteen.id, accepting_orders: newStatus }
      });
      
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

  const createCanteen = async (canteenData: { name: string; location?: string; description?: string; image_url?: string }) => {
    if (!user || user.role !== 'admin') {
      toast.error('You must be an admin to create a canteen.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('canteens')
        .insert({
          name: canteenData.name,
          location: canteenData.location || '',
          description: canteenData.description || '',
          image_url: canteenData.image_url || '',
          admin_user_id: user.id,
          is_active: true,
          accepting_orders: true
        })
        .select()
        .single();
      if (error) {
        console.error('Error creating canteen:', error);
        toast.error('Failed to create canteen: ' + error.message);
        return;
      }
      toast.success('Canteen created successfully!');
      setCanteen({
        id: data.id,
        name: data.name,
        location: data.location,
        description: data.description,
        image_url: data.image_url,
        is_active: data.is_active,
        accepting_orders: data.accepting_orders
      });
    } catch (error) {
      console.error('Error in createCanteen:', error);
      toast.error('Failed to create canteen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCanteen();
  }, [user]);

  useEffect(() => {
    if (canteen) {
      let isSubscribed = true;

      const loadStats = async () => {
        if (isSubscribed) {
          await refreshStats();
        }
      };

      loadStats();

      // Poll for admin updates every 15 seconds
      const interval = setInterval(() => {
        if (isSubscribed) {
          refreshStats();
        }
      }, 15000); // Poll every 15 seconds

      return () => {
        isSubscribed = false;
        clearInterval(interval);
      };
    }
  }, [canteen?.id]);

  const value = {
    canteen,
    stats,
    loading,
    toggleOrderAcceptance,
    refreshCanteen,
    refreshStats,
    createCanteen
  };

  return (
    <AdminCanteenContext.Provider value={value}>
      {children}
    </AdminCanteenContext.Provider>
  );
};
