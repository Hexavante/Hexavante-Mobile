import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  ApiError,
  VerificationRequiredError,
  getSession,
  getToken,
  registerWithEmail,
  resendDeviceCode,
  setToken,
  signInWithEmail,
  verifyDeviceCode,
  type AuthSession,
  type RegisterData,
} from '@/lib/api';

export type PendingVerification = {
  verificationId: string;
  reason: string;
};

type AuthContextValue = {
  user: AuthSession['user'] | null;
  loading: boolean;
  pendingVerification: PendingVerification | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  cancelVerification: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);

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
    try {
      const session = await signInWithEmail(email, password);
      await setToken(session.token);
      setUser(session.user);
    } catch (e) {
      if (e instanceof VerificationRequiredError) {
        setPendingVerification({ verificationId: e.verificationId, reason: e.reason });
        return;
      }
      throw e;
    }
  }, []);

  const signUp = useCallback(async (data: RegisterData) => {
    await registerWithEmail(data);
    // cadastro não abre sessão — entra em seguida (pode cair em verificação)
    try {
      const session = await signInWithEmail(data.email, data.password);
      await setToken(session.token);
      setUser(session.user);
    } catch (e) {
      if (e instanceof VerificationRequiredError) {
        setPendingVerification({ verificationId: e.verificationId, reason: e.reason });
        return;
      }
      throw e;
    }
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      if (!pendingVerification) throw new Error('Nenhuma verificação pendente.');
      const session = await verifyDeviceCode(pendingVerification.verificationId, code.trim());
      await setToken(session.token);
      setUser(session.user);
      setPendingVerification(null);
    },
    [pendingVerification],
  );

  const resendCode = useCallback(async () => {
    if (!pendingVerification) throw new Error('Nenhuma verificação pendente.');
    const verificationId = await resendDeviceCode(pendingVerification.verificationId);
    setPendingVerification({ verificationId, reason: pendingVerification.reason });
  }, [pendingVerification]);

  const cancelVerification = useCallback(() => {
    setPendingVerification(null);
  }, []);

  const signOut = useCallback(async () => {
    await setToken(null);
    setUser(null);
    setPendingVerification(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      pendingVerification,
      signIn,
      signUp,
      verifyCode,
      resendCode,
      cancelVerification,
      signOut,
    }),
    [user, loading, pendingVerification, signIn, signUp, verifyCode, resendCode, cancelVerification, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

export { ApiError };
