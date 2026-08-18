import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://api.hexavante.com.br';
export const APP_URL = 'https://hexavante.com.br';

const TOKEN_KEY = 'hexavante_access_token';

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

  if (token) headers['Authorization'] = `Bearer ${token}`;

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

export async function signInWithEmail(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as {
    token?: string;
    user?: AuthSession['user'];
    message?: string;
    error?: string;
  };

  if (!res.ok || !data.token || !data.user) {
    throw new ApiError(res.status, data.message || data.error || 'Falha ao entrar');
  }

  return { user: data.user, token: data.token };
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = (await res.json()) as {
    token?: string;
    user?: AuthSession['user'];
    message?: string;
    error?: string;
  };

  if (!res.ok || !data.token || !data.user) {
    throw new ApiError(res.status, data.message || data.error || 'Falha ao cadastrar');
  }

  return { user: data.user, token: data.token };
}

export async function getSession(token: string): Promise<{ user: AuthSession['user'] }> {
  return api<{ user: AuthSession['user'] }>('/api/auth/get-session', { token });
}

export function socialAuthUrl(provider: 'google' | 'github'): string {
  return `${API_BASE_URL}/api/auth/sign-in/social?provider=${provider}&callbackURL=${encodeURIComponent(APP_URL)}`;
}