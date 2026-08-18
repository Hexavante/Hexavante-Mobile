import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  ApiError,
  getSession,
  getToken,
  registerWithEmail,
  setToken,
  signInWithEmail,
  type AuthSession,
} from '@/lib/api';

type AuthContextValue = {
  user: AuthSession['user'] | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const token = await getToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const session = await getSession(token);
        if (active) setUser(session.user);
      } catch {
        await setToken(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await signInWithEmail(email, password);
    await setToken(session.token);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const session = await registerWithEmail(name, email, password);
    await setToken(session.token);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

export { ApiError };