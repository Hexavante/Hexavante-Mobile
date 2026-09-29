import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import {
  ApiError,
  buildSocialAuthUrl,
  exchangeSocialCode,
  setToken,
  type SocialProvider,
  type SocialSession,
} from '@/lib/api';

const GENERIC_ERROR = 'Não foi possível entrar com a conta social.';

/**
 * O usuário fechou/negou o navegador antes de concluir.
 * A tela NÃO deve exibir mensagem nem feedback de erro — use `isSocialAuthCancelled`.
 */
export class SocialAuthCancelledError extends Error {
  constructor() {
    super('Autenticação social cancelada.');
    this.name = 'SocialAuthCancelledError';
  }
}

export function isSocialAuthCancelled(error: unknown): boolean {
  return error instanceof Error && error.name === 'SocialAuthCancelledError';
}

// Códigos vindos da API (?error=<codigo>) → mensagem amigável em pt-BR.
const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Você cancelou o acesso.',
  oauth_access_denied: 'Você cancelou o acesso.',
  oauth_cancelled: 'Você cancelou o acesso.',
  oauth_invalid_state: 'Sessão expirada. Tente novamente.',
  oauth_no_email: 'O provedor não retornou seu e-mail. Use e-mail e senha.',
  oauth_provider_not_found: 'Provedor não suportado.',
  provider_not_found: 'Provedor não suportado.',
};

/** Qualquer `oauth_*` não mapeado (e códigos desconhecidos) caem no genérico. */
function messageForErrorCode(code: string): string {
  return ERROR_MESSAGES[code] ?? GENERIC_ERROR;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && typeof v === 'string' ? v : undefined;
}

/**
 * Abre o provider no navegador embutido, recebe o one-time code no redirect
 * `hexavante://auth/callback?code=...` e troca por sessão.
 *
 * Lança:
 * - `SocialAuthCancelledError` — navegador fechado/descartado (silencioso na UI);
 * - `Error` com mensagem pt-BR — erro do provider, code ausente ou API fora do ar.
 */
export async function signInWithSocial(provider: SocialProvider): Promise<SocialSession> {
  const redirectUri = Linking.createURL('auth/callback');

  let result: WebBrowser.WebBrowserAuthSessionResult;
  try {
    result = await WebBrowser.openAuthSessionAsync(buildSocialAuthUrl(provider, redirectUri), redirectUri);
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (result.type !== 'success') {
    // cancel/dismiss: usuário voltou sem concluir → silencioso.
    throw new SocialAuthCancelledError();
  }

  const params = Linking.parse(result.url).queryParams ?? {};

  const errorCode = firstParam(params.error);
  if (errorCode) throw new Error(messageForErrorCode(errorCode));

  const code = firstParam(params.code);
  // Sem `code` e sem `error`: o navegador parou numa resposta da API
  // (ex.: 400 {"error":"Provider não configurado"}) em vez de redirecionar.
  if (!code) throw new Error(GENERIC_ERROR);

  let session: SocialSession;
  try {
    session = await exchangeSocialCode(code);
  } catch (e) {
    if (e instanceof ApiError && e.message && !/^Erro \d+$/.test(e.message)) {
      throw new Error(e.message);
    }
    throw new Error(GENERIC_ERROR);
  }

  await setToken(session.token);
  return session;
}
