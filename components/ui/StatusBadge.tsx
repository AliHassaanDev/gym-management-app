import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius } from '../../constants/theme';

export interface BadgeProps {
  status: 'paid' | 'due' | 'overdue' | 'active' | 'inactive';
  small?: boolean;
}

const statusConfig = {
  paid:     { label: 'Paid',     bg: Colors.successBg, text: Colors.successText },
  due:      { label: 'Due',      bg: Colors.warningBg, text: Colors.warningText },
  overdue:  { label: 'Overdue',  bg: Colors.dangerBg,  text: Colors.dangerText },
  active:   { label: 'Active',   bg: Colors.successBg, text: Colors.successText },
  inactive: { label: 'Inactive', bg: Colors.surfaceSubtle, text: Colors.textMuted },
};

export const StatusBadge = ({ status, small }: BadgeProps) => {
  const cfg = statusConfig[status] ?? statusConfig.paid;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, small && styles.small]}>
      <Text style={[styles.label, { color: cfg.text }, small && styles.smallText]}>
        {cfg.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  smallText: {
    fontSize: 11,
  },
});
