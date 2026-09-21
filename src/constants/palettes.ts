// Paletas dos temas da loja (espelham Hexavante/src/lib/cosmetics.ts).
// Mesmas chaves do Palette original para migração mecânica.

export type AppPalette = {
  bg: string;
  surface: string;
  surfaceStrong: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  highlight: string;
  highlightSoft: string;
  highlightBorder: string;
  cyan: string;
  sky: string;
  violet: string;
  amber: string;
  orange: string;
  emerald: string;
  red: string;
  gold: string;
  white: string;
  skeleton: string;
};

function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

type Base = {
  bg: string;
  surface: string;
  surfaceStrong: string;
  card: string;
  border: string;
  text: string;
  highlight: string;
  cyan?: string;
};

function build(base: Base): AppPalette {
  const cyan = base.cyan ?? base.highlight;
  return {
    bg: base.bg,
    surface: base.surface,
    surfaceStrong: base.surfaceStrong,
    card: base.card,
    border: base.border,
    text: base.text,
    textMuted: alpha(base.text, 0.6),
    textSubtle: alpha(base.text, 0.45),
    highlight: base.highlight,
    highlightSoft: alpha(base.highlight, 0.12),
    highlightBorder: alpha(base.highlight, 0.28),
    cyan,
    sky: '#38bdf8',
    violet: '#a78bfa',
    amber: '#fbbf24',
    orange: '#fb923c',
    emerald: '#34d399',
    red: '#ef4444',
    gold: '#fcd34d',
    white: '#ffffff',
    skeleton: alpha(base.text, 0.08),
  };
}

export const DEFAULT_THEME_ID = 'default';

export const THEME_META: Record<string, { label: string }> = {
  default: { label: 'Hexavante' },
  cyberpunk: { label: 'Dark Cyberpunk' },
  hacker: { label: 'Hacker / Matrix' },
  obsidian: { label: 'Obsidian Dark' },
  sunset: { label: 'Sunset Glow' },
  ocean: { label: 'Deep Ocean' },
  sakura: { label: 'Sakura Bloom' },
  midnight: { label: 'Midnight Violet' },
  amber: { label: 'Golden Amber' },
  snow: { label: 'Neve Branca' },
  daylight: { label: 'Luz do Dia' },
  cream: { label: 'Creme Suave' },
  pearl: { label: 'Pérola Clara' },
};

export const PALETTES: Record<string, AppPalette> = {
  default: build({
    bg: '#06080f',
    surface: 'rgba(15,23,42,0.78)',
    surfaceStrong: 'rgba(15,23,42,0.96)',
    card: '#0f172a',
    border: 'rgba(255,255,255,0.1)',
    text: '#f8fafc',
    highlight: '#22d3ee',
    cyan: '#22d3ee',
  }),
  cyberpunk: build({
    bg: '#0c0614',
    surface: 'rgba(26,15,46,0.88)',
    surfaceStrong: 'rgba(12,6,20,0.97)',
    card: '#1a0f2e',
    border: 'rgba(217,70,239,0.18)',
    text: '#faf5ff',
    highlight: '#d946ef',
    cyan: '#22d3ee',
  }),
  hacker: build({
    bg: '#030a05',
    surface: 'rgba(10,31,18,0.9)',
    surfaceStrong: 'rgba(3,10,5,0.98)',
    card: '#0a1f12',
    border: 'rgba(34,197,94,0.18)',
    text: '#ecfdf5',
    highlight: '#22c55e',
    cyan: '#4ade80',
  }),
  obsidian: build({
    bg: '#020203',
    surface: 'rgba(12,12,16,0.92)',
    surfaceStrong: 'rgba(2,2,3,0.98)',
    card: '#0c0c10',
    border: 'rgba(148,163,184,0.12)',
    text: '#e2e8f0',
    highlight: '#6366f1',
  }),
  sunset: build({
    bg: '#1a0a08',
    surface: 'rgba(42,18,16,0.9)',
    surfaceStrong: 'rgba(26,10,8,0.97)',
    card: '#2a1210',
    border: 'rgba(249,115,22,0.18)',
    text: '#fff7ed',
    highlight: '#f97316',
  }),
  ocean: build({
    bg: '#041018',
    surface: 'rgba(12,36,51,0.9)',
    surfaceStrong: 'rgba(4,16,24,0.97)',
    card: '#0c2433',
    border: 'rgba(14,165,233,0.18)',
    text: '#ecfeff',
    highlight: '#0ea5e9',
  }),
  sakura: build({
    bg: '#1a0a14',
    surface: 'rgba(42,16,32,0.9)',
    surfaceStrong: 'rgba(26,10,20,0.97)',
    card: '#2a1020',
    border: 'rgba(236,72,153,0.18)',
    text: '#fdf2f8',
    highlight: '#ec4899',
  }),
  midnight: build({
    bg: '#08051a',
    surface: 'rgba(21,16,42,0.92)',
    surfaceStrong: 'rgba(8,5,26,0.98)',
    card: '#15102a',
    border: 'rgba(139,92,246,0.18)',
    text: '#f5f3ff',
    highlight: '#8b5cf6',
  }),
  amber: build({
    bg: '#14100a',
    surface: 'rgba(36,28,16,0.92)',
    surfaceStrong: 'rgba(20,16,10,0.98)',
    card: '#241c10',
    border: 'rgba(245,158,11,0.18)',
    text: '#fffbeb',
    highlight: '#f59e0b',
  }),
  snow: build({
    bg: '#ffffff',
    surface: 'rgba(255,255,255,0.95)',
    surfaceStrong: '#ffffff',
    card: '#f1f5f9',
    border: 'rgba(0,0,0,0.08)',
    text: '#1e293b',
    highlight: '#5865f2',
  }),
  daylight: build({
    bg: '#f8fafc',
    surface: 'rgba(255,255,255,0.95)',
    surfaceStrong: '#ffffff',
    card: '#f0fdfa',
    border: 'rgba(0,0,0,0.08)',
    text: '#1e293b',
    highlight: '#0d9488',
  }),
  cream: build({
    bg: '#fffdf7',
    surface: 'rgba(255,255,255,0.95)',
    surfaceStrong: '#ffffff',
    card: '#fef9ee',
    border: 'rgba(0,0,0,0.08)',
    text: '#292524',
    highlight: '#d97706',
  }),
  pearl: build({
    bg: '#faf9fe',
    surface: 'rgba(255,255,255,0.95)',
    surfaceStrong: '#ffffff',
    card: '#f5f3ff',
    border: 'rgba(0,0,0,0.08)',
    text: '#1e1b4b',
    highlight: '#7c3aed',
  }),
};
