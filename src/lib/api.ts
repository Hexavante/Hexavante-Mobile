import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
export const API_BASE_URL = extra.apiUrl || 'https://api.hexavante.com.br';
export const APP_URL = extra.appUrl || 'https://hexavante.com.br';

const TOKEN_KEY = 'hexavante_access_token';

// A API autentica via cookie __Secure-hexavante.session_token
// (parseSessionToken só lê cookie — Authorization: Bearer é ignorado).
const SESSION_COOKIE = '__Secure-hexavante.session_token';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Storage indisponível — ignora
  }
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (token) headers['Cookie'] = `${SESSION_COOKIE}=${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      message = data.message || data.error || message;
    } catch {
      // corpo não-JSON
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
    image?: string | null;
    role?: string;
  };
  token: string;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string | null;
  roles?: string[];
};

function normalizeUser(u: ApiUser): AuthSession['user'] {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    username: u.username,
    image: u.avatarUrl ?? null,
    role: u.roles?.[0],
  };
}

export class VerificationRequiredError extends Error {
  verificationId: string;
  reason: string;
  constructor(verificationId: string, reason: string) {
    super('Verificação necessária. Enviamos um código para o seu e-mail.');
    this.name = 'VerificationRequiredError';
    this.verificationId = verificationId;
    this.reason = reason;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as {
    user?: ApiUser;
    session?: { token?: string };
    requiresVerification?: boolean;
    verificationId?: string;
    reason?: string;
    message?: string;
    error?: string;
  };

  if (res.status === 202 && data.requiresVerification && data.verificationId) {
    throw new VerificationRequiredError(data.verificationId, data.reason ?? 'DEVICE');
  }

  if (!res.ok || !data.user || !data.session?.token) {
    throw new ApiError(res.status, data.message || data.error || 'Falha ao entrar');
  }

  return { user: normalizeUser(data.user), token: data.session.token };
}

export async function verifyDeviceCode(verificationId: string, code: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationId, code }),
  });

  const data = (await res.json()) as {
    user?: ApiUser;
    session?: { token?: string };
    message?: string;
    error?: string;
  };

  if (!res.ok || !data.user || !data.session?.token) {
    throw new ApiError(res.status, data.message || data.error || 'Código inválido');
  }

  return { user: normalizeUser(data.user), token: data.session.token };
}

export async function resendDeviceCode(verificationId: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/resend-device-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationId }),
  });

  const data = (await res.json()) as {
    verificationId?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok || !data.verificationId) {
    throw new ApiError(res.status, data.message || data.error || 'Falha ao reenviar código');
  }

  return data.verificationId;
}

export type RegisterData = {
  username: string;
  fullName: string;
  email: string;
  password: string;
  birthDate: string; // YYYY-MM-DD
};

export async function registerWithEmail(data: RegisterData): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = (await res.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };

  if (!res.ok && res.status !== 201) {
    throw new ApiError(res.status, body.message || body.error || 'Falha ao cadastrar');
  }
}

export async function getSession(token: string): Promise<{ user: AuthSession['user'] }> {
  const res = await api<{ user: ApiUser }>('/api/v1/auth/session', { token });
  return { user: normalizeUser(res.user) };
}

export function socialAuthUrl(provider: 'google' | 'github'): string {
  return `${API_BASE_URL}/api/auth/sign-in/social?provider=${provider}&callbackURL=${encodeURIComponent(APP_URL)}`;
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const data = await api<{ ok: boolean; verificationId: string | null }>('/api/v1/auth/forgot-password', { method: 'POST', body: { email } });
  return data.verificationId;
}

export async function resetPassword(verificationId: string, code: string, password: string): Promise<void> {
  await api<{ ok: boolean }>('/api/v1/auth/reset-password', { method: 'POST', body: { verificationId, code, password } });
}