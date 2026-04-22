import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';
import { Button, Card, Avatar, Badge, StarRating, Input } from './base';

export function DesignSystemPreview() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Colors */}
      <Text style={styles.sectionTitle}>Colors</Text>
      <View style={styles.colorGrid}>
        <Text style={styles.label}>Primary</Text>
        <View style={styles.colorRow}>
          {Object.entries(colors.primary).map(([key, value]) => (
            <View key={key} style={[styles.colorSwatch, { backgroundColor: value }]}>
              <Text style={styles.colorLabel}>{key}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.label}>Accent</Text>
        <View style={styles.colorRow}>
          {Object.entries(colors.accent).map(([key, value]) => (
            <View key={key} style={[styles.colorSwatch, { backgroundColor: value }]}>
              <Text style={styles.colorLabel}>{key}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Typography */}
      <Text style={styles.sectionTitle}>Typography</Text>
      <Card>
        <Text style={styles.heroText}>Hero / 5xl</Text>
        <Text style={styles.headingText}>Heading / 3xl</Text>
        <Text style={styles.subheadingText}>Subheading / xl</Text>
        <Text style={styles.bodyText}>Body / base - Regular paragraph text</Text>
        <Text style={styles.captionText}>Caption / sm - Small supporting text</Text>
      </Card>

      {/* Buttons */}
      <Text style={styles.sectionTitle}>Buttons</Text>
      <View style={styles.buttonRow}>
        <Button title="Primary" onPress={() => {}} />
        <Button title="Secondary" variant="secondary" onPress={() => {}} />
        <Button title="Outline" variant="outline" onPress={() => {}} />
        <Button title="Ghost" variant="ghost" onPress={() => {}} />
      </View>
      <View style={[styles.buttonRow, { marginTop: spacing[3] }]}>
        <Button title="Small" size="sm" onPress={() => {}} />
        <Button title="Medium" size="md" onPress={() => {}} />
        <Button title="Large" size="lg" onPress={() => {}} />
        <Button title="Loading" loading onPress={() => {}} />
      </View>

      {/* Inputs */}
      <Text style={styles.sectionTitle}>Inputs</Text>
      <View style={styles.inputRow}>
        <Input label="Email" placeholder="you@example.com" containerStyle={{ flex: 1 }} />
        <Input label="Error" placeholder="Invalid input" error="This field is required" containerStyle={{ flex: 1 }} />
      </View>

      {/* Avatar & Badges */}
      <Text style={styles.sectionTitle}>Avatar & Badges</Text>
      <View style={styles.row}>
        <Avatar name="Max Mustermann" size="sm" />
        <Avatar name="Max Mustermann" size="md" />
        <Avatar name="Max Mustermann" size="lg" />
        <Badge label="Verified" variant="success" />
        <Badge label="Pending" variant="warning" />
        <Badge label="Spam" variant="error" />
      </View>

      {/* Star Rating */}
      <Text style={styles.sectionTitle}>Star Rating</Text>
      <StarRating rating={3} size={24} />
      <View style={{ height: spacing[4] }} />
      <StarRating rating={5} size={32} />
      <View style={{ height: spacing[4] }} />
      <StarRating rating={2} size={16} onRate={(r) => console.log(r)} />

      {/* Cards */}
      <Text style={styles.sectionTitle}>Cards</Text>
      <Card elevated>
        <Text style={styles.cardTitle}>Geheimtipp</Text>
        <Text style={styles.cardBody}>Ein gemütliches Café in der Innenstadt mit hervorragendem Kaffee und WLAN.</Text>
        <View style={styles.cardFooter}>
          <StarRating rating={4} size={14} />
          <Badge label="Café" variant="default" />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[6],
    gap: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  colorGrid: {
    gap: spacing[1],
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  colorLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroText: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headingText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  subheadingText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  bodyText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  captionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  cardBody: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing[4],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
});