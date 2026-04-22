import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing, typography } from '../../theme/tokens';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

const fontSizeMap = {
  sm: typography.fontSize.xs,
  md: typography.fontSize.base,
  lg: typography.fontSize.xl,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ uri, name = '', size = 'md', style }: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: colors.primary[400],
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[containerStyle, { resizeMode: 'cover' }, style as ImageStyle]}
      />
    );
  }

  return (
    <View style={[containerStyle, styles.initialsContainer, style]}>
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[400],
  },
  initials: {
    color: colors.textOnPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
});