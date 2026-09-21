import { Text, View, StyleSheet } from 'react-native';
import { Coins, Crown } from 'lucide-react-native';

import { Radius } from '@/constants/theme';
import { usePalette } from '@/lib/theme-context';
import type { AppPalette } from '@/constants/palettes';
import type { XpProfile } from '@/lib/types';

export function XpBar({ profile }: { profile: XpProfile }) {
  const P = usePalette();
  const styles = makeStyles(P);
  const width = `${Math.min(100, Math.max(0, profile.progressPercent))}%` as `${number}%`;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.levelChip}>
          <Crown size={12} color={P.highlight} />
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
        <Coins size={12} color={P.gold} />
        <Text style={styles.coins}>{profile.totalXp} pts</Text>
      </View>
    </View>
  );
}

function makeStyles(P: AppPalette) {
  return StyleSheet.create({
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
      color: P.highlight,
      fontSize: 13,
      fontWeight: '700',
    },
    xpText: {
      color: P.textMuted,
      fontSize: 12,
      fontVariant: ['tabular-nums'],
    },
    track: {
      height: 8,
      borderRadius: Radius.full,
      backgroundColor: P.skeleton,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: Radius.full,
      backgroundColor: P.highlight,
    },
    league: {
      color: P.textSubtle,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    coins: {
      color: P.gold,
      fontSize: 12,
      fontWeight: '700',
    },
  });
}