import type { ReactNode } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = ({ label, error, icon, style, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : null, style as any]}
          placeholderTextColor={Colors.textMuted}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputError: { borderColor: Colors.danger },
  iconWrap: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 13,
  },
  inputWithIcon: { paddingLeft: 0 },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
});
