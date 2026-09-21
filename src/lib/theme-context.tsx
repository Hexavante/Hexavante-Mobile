import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as SecureStore from 'expo-secure-store';
import { DEFAULT_THEME_ID, PALETTES, type AppPalette } from '@/constants/palettes';

const THEME_KEY = 'hexavante_theme_id';

type ThemeContextValue = {
  themeId: string;
  palette: AppPalette;
  setThemeId: (id: string) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  palette: PALETTES[DEFAULT_THEME_ID],
  setThemeId: async () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    let active = true;
    void SecureStore.getItemAsync(THEME_KEY).then((saved) => {
      if (active && saved && PALETTES[saved]) setThemeIdState(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  const setThemeId = useCallback(async (id: string) => {
    if (!PALETTES[id]) return;
    setThemeIdState(id);
    try {
      await SecureStore.setItemAsync(THEME_KEY, id);
    } catch {
      // storage indisponível — mantém só em memória
    }
  }, []);

  const value = useMemo(
    () => ({ themeId, palette: PALETTES[themeId] ?? PALETTES[DEFAULT_THEME_ID], setThemeId }),
    [themeId, setThemeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function usePalette(): AppPalette {
  return useContext(ThemeContext).palette;
}

export function useThemeChoice() {
  const { themeId, setThemeId } = useContext(ThemeContext);
  return { themeId, setThemeId };
}
