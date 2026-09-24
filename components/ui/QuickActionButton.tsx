import type { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}

export const QuickActionButton = ({ icon, label, onPress }: QuickActionProps) => (
  <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.iconCircle}>{icon}</View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
