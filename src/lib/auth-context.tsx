import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from './auth-store';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
});

function mapSupabaseUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: (supabaseUser.user_metadata?.name as string) ?? '',
    isVerified: true,
    createdAt: supabaseUser.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  return (
    <AuthContext.Provider value={{ user, loading, isPasswordRecovery, clearPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
