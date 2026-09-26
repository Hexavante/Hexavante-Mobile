import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';

import { useAuth } from '@/lib/auth-context';
import { useToken } from '@/hooks/use-token';
import { shopApi, notificationsApi } from '@/lib/features';
import { getThemeIdOf } from '@/lib/theme-shop';
import { useThemeChoice } from '@/lib/theme-context';
import { registerForPushNotifications } from '@/lib/notifications';

// Sincroniza tema do servidor (F2) + registra push token.
// Roda quando há usuário logado; silencioso em erro.
export function useServerThemeSync() {
  const { user } = useAuth();
  const token = useToken();
  const { setThemeId } = useThemeChoice();
  const pushSent = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    let active = true;

    shopApi(token)
      .inventory()
      .then((res) => {
        if (!active) return;
        const now = new Date();
        const equipped = (res.items ?? []).find((e) => {
          if (!e.isEquipped) return false;
          if (e.expiresAt && new Date(e.expiresAt) <= now) return false;
          return getThemeIdOf(e.item) != null;
        });
        const themeId = equipped ? getThemeIdOf(equipped.item) : null;
        if (themeId) void setThemeId(themeId);
      })
      .catch(() => {});

    registerForPushNotifications()
      .then((expoToken) => {
        if (!active || !expoToken || pushSent.current === expoToken) return;
        pushSent.current = expoToken;
        return notificationsApi(token)
          .registerPush(expoToken, Device.modelName ?? undefined)
          .catch(() => {
            pushSent.current = null;
          });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user?.id, token, setThemeId]);
}
