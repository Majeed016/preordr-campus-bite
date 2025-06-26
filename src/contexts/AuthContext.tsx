
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
          // Create basic profile immediately from session data
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || 'User',
            role: (session.user.user_metadata?.role as 'user' | 'admin') || 'user'
          };
          setUser(basicProfile);
          
          // Try to create/update profile in database after a delay
          setTimeout(async () => {
            try {
              // First check if profile exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (existingProfile) {
                setUser(existingProfile);
              } else {
                // Try to create profile
                const { data: newProfile, error } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || session.user.email || 'User',
                    role: (session.user.user_metadata?.role as 'user' | 'admin') || 'user'
                  })
                  .select()
                  .single();
                
                if (newProfile && !error) {
                  setUser(newProfile);
                }
              }
            } catch (err) {
              console.log('Profile operation failed, continuing with basic profile:', err);
              // Keep the basic profile even if database operations fail
            }
          }, 1000);
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

  const register = async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user', canteenData?: CanteenData) => {
    setLoading(true);
    try {
      console.log('Attempting registration for:', email, 'with role:', role);
      
      // Create the auth user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          },
          // Skip email confirmation for development
          emailRedirectTo: undefined
        }
      });
      
      if (error) {
        console.error('Registration error:', error.message);
        throw new Error(error.message);
      }
      
      if (!data.user) {
        throw new Error('User creation failed');
      }
      
      console.log('Registration successful for:', data.user.email);
      
      // Create profile immediately after user creation
      try {
        console.log('Creating profile for user:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            role: role
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('Profile created successfully');
        }
      } catch (err) {
        console.error('Profile creation failed:', err);
      }
      
      // For admin registration with canteen data
      if (role === 'admin' && canteenData && data.user) {
        try {
          // Wait a bit for the profile to be created
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('Creating canteen for admin:', data.user.id);
          const { data: canteenResult, error: canteenError } = await supabase
            .from('canteens')
            .insert({
              name: canteenData.canteenName,
              location: canteenData.canteenLocation || 'Not specified',
              admin_user_id: data.user.id,
              is_active: true,
              accepting_orders: true,
              description: `Welcome to ${canteenData.canteenName}! We serve delicious food with love.`
            })
            .select();
          
          if (canteenError) {
            console.error('Error creating canteen:', canteenError);
            throw new Error(`Failed to create canteen: ${canteenError.message}`);
          } else {
            console.log('Canteen created successfully:', canteenResult);
          }
        } catch (err) {
          console.error('Error creating canteen:', err);
          throw new Error('Failed to create canteen for admin user');
        }
      }
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        throw new Error(error.message);
      }
      
      console.log('Login successful for:', data.user?.email);
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
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
