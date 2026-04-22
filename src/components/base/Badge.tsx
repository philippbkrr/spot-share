import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme/tokens';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

const variantStyles = {
  default: {
    backgroundColor: colors.neutral[100],
    color: colors.textSecondary,
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: variantStyle.backgroundColor }, style]}>
      <Text style={[styles.text, { color: variantStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});