
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
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
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
                // Create a basic profile if it doesn't exist
                const basicProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email || '',
                  role: 'user'
                };
                setUser(basicProfile);
                
                // Try to create the profile in the database
                await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || session.user.email || '',
                    role: 'user'
                  });
              }
            } catch (err) {
              console.error('Error in profile setup:', err);
              // Create basic profile as fallback
              const basicProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email || '',
                role: 'user'
              };
              setUser(basicProfile);
            }
          }, 100);
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
      
      // Create the auth user without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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
      
      if (!data.user) {
        throw new Error('User creation failed');
      }
      
      console.log('Registration successful:', data);
      
      // Since email confirmation is disabled, the user should be immediately available
      // The trigger should create the profile automatically
      
      // If admin registration with canteen data, create canteen
      if (role === 'admin' && canteenData && data.user) {
        try {
          // Wait a bit for the profile to be created by the trigger
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
