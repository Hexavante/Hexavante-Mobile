import { Text, View, StyleSheet } from 'react-native';
import { Coins, Crown } from 'lucide-react-native';

import { Palette, Radius } from '@/constants/theme';
import type { XpProfile } from '@/lib/types';

export function XpBar({ profile }: { profile: XpProfile }) {
  const width = `${Math.min(100, Math.max(0, profile.progressPercent))}%` as `${number}%`;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.levelChip}>
          <Crown size={12} color={Palette.highlight} />
          <Text style={styles.levelText}>Nível {profile.level}</Text>
        </View>
        <Text style={styles.xpText}>
          {profile.currentXp} / {profile.xpToNextLevel} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width }]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.league}>{profile.league}</Text>
        <Coins size={12} color={Palette.gold} />
        <Text style={styles.coins}>{profile.totalXp} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    color: Palette.highlight,
    fontSize: 13,
    fontWeight: '700',
  },
  xpText: {
    color: Palette.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.skeleton,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Palette.highlight,
  },
  league: {
    color: Palette.textSubtle,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coins: {
    color: Palette.gold,
    fontSize: 12,
    fontWeight: '700',
  },
});