import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  onRate,
}: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onRate?.(starNumber)}
            disabled={!onRate}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.star,
                {
                  fontSize: size,
                  lineHeight: size * 1.2,
                  color: isFilled ? colors.accent[500] : colors.neutral[300],
                },
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  star: {
    fontWeight: '400',
  },
});