import type { ReactNode } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  label, onPress, variant = 'primary', loading, disabled, fullWidth, icon,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.full,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.primaryText : Colors.primary} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { width: '100%' },
  primary: { backgroundColor: Colors.primary },
  outline: { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: 'transparent' },
  ghost:   { backgroundColor: 'transparent' },
  danger:  { backgroundColor: Colors.danger },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: 8 },
  label: { fontFamily: Fonts.bold, fontSize: 15 },
  primaryText: { color: Colors.primaryText },
  outlineText: { color: Colors.primary },
  ghostText:   { color: Colors.textSecondary },
  dangerText:  { color: '#fff' },
});
