import type { ShopItem } from '@/lib/types';

// Extrai o themeId de itens THEME da loja (metadata.themeId vem da API).
export function getThemeIdOf(item: Pick<ShopItem, 'category' | 'metadata'>): string | null {
  if (item.category !== 'THEME') return null;
  const meta = item.metadata as { themeId?: string } | null | undefined;
  return meta?.themeId ?? null;
}

// Tema pode ser usado se o item é possuído (permanente ou temporário ativo).
export function isThemeUsable(item: Pick<ShopItem, 'category' | 'ownershipStatus' | 'metadata'>): boolean {
  if (!getThemeIdOf(item)) return false;
  return item.ownershipStatus === 'owned_permanent' || item.ownershipStatus === 'active_temporary';
}
