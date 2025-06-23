
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
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
  user: UserProfile | null;
  session: Session | null;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from our profiles table
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile && !error) {
              setUser(profile);
            } else {
              console.error('Error fetching profile:', error);
              // If profile doesn't exist, create a basic one
              if (error?.code === 'PGRST116') {
                const basicProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email || '',
                  role: 'user'
                };
                setUser(basicProfile);
              } else {
                setUser(null);
              }
            }
          } catch (err) {
            console.error('Error in auth state change:', err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error details:', error);
        throw new Error(error.message);
      }
      
      console.log('Login successful for:', data.user?.email);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user', canteenData?: CanteenData) => {
    setLoading(true);
    try {
      console.log('Attempting registration for:', email);
      
      // First create the auth user without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        console.error('Registration error details:', error);
        throw new Error(error.message);
      }
      
      console.log('Registration successful:', data);
      
      // The trigger should automatically create the profile, but let's ensure it exists
      if (data.user) {
        // Wait a moment for the trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile was created by trigger, if not create it manually
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (!existingProfile) {
          console.log('Creating profile manually...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              name: name,
              role: role
            });
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
          } else {
            console.log('Profile created successfully');
          }
        }
        
        // If admin registration with canteen data, create canteen
        if (role === 'admin' && canteenData) {
          try {
            const { error: canteenError } = await supabase
              .from('canteens')
              .insert({
                name: canteenData.canteenName,
                location: canteenData.canteenLocation,
                admin_user_id: data.user.id
              });
            
            if (canteenError) {
              console.error('Error creating canteen:', canteenError);
            } else {
              console.log('Canteen created successfully');
            }
          } catch (err) {
            console.error('Error creating canteen:', err);
          }
        }
      }
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    session,
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
