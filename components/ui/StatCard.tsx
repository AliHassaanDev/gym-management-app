import type { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  icon?: ReactNode;
  onPress?: () => void;
}

export const StatCard = ({
  label, value, badge, badgeColor = Colors.success, icon, onPress,
}: StatCardProps) => {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {icon && <View style={styles.iconRow}>{icon}</View>}
      <Text style={styles.value}>{value}</Text>
      {badge ? (
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, { color: badgeColor }]}>↑ {badge}</Text>
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: 4,
  },
  iconRow: { marginBottom: 4 },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  badge: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
