
import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthActions } from '@/hooks/useAuthActions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading: sessionLoading } = useAuthSession();
  const { userProfile } = useUserProfile(user);
  const { signIn, signUp, signOut, loading: actionLoading } = useAuthActions();

  const loading = sessionLoading || actionLoading;

  const value = {
    user,
    session,
    userProfile,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
