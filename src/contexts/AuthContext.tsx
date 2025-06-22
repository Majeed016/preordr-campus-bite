
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface CanteenData {
  canteenName: string;
  canteenLocation: string;
  canteenPhoto: File | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'user' | 'admin', canteenData?: CanteenData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage for demo)
    const storedUser = localStorage.getItem('cafepreorder_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Demo login - in real app, this would use Supabase
      console.log('Login attempt:', { email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data with role-based routing
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user'
      };
      
      setUser(mockUser);
      localStorage.setItem('cafepreorder_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user', canteenData?: CanteenData) => {
    setLoading(true);
    try {
      // Demo registration - in real app, this would use Supabase
      console.log('Register attempt:', { email, password, name, role, canteenData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If admin registration, simulate canteen creation
      if (role === 'admin' && canteenData) {
        console.log('Creating canteen:', canteenData);
        // In real app: upload photo to Supabase Storage, create canteen record
        localStorage.setItem('demo_canteen', JSON.stringify({
          id: Date.now().toString(),
          name: canteenData.canteenName,
          location: canteenData.canteenLocation,
          admin_user_id: Date.now().toString()
        }));
      }
      
      // Mock user data
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role
      };
      
      setUser(mockUser);
      localStorage.setItem('cafepreorder_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cafepreorder_user');
    localStorage.removeItem('selected_canteen');
    localStorage.removeItem('demo_canteen');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
