import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Button, Input, Card } from './base';
import { MapPin, Navigation, X, Image, Tag } from 'lucide-react-native';

interface CreateSpotScreenProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialLocation?: { latitude: number; longitude: number } | null;
}

export function CreateSpotScreen({ onClose, onSuccess, initialLocation }: CreateSpotScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation || null
  );
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUseCurrentLocation() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Fehler', 'Standort-Berechtigung benötigt');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // Reverse geocode to get city name
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address) {
        setCity(address.city || address.subregion || '');
      }
    } catch (e) {
      Alert.alert('Fehler', 'Standort konnte nicht ermittelt werden');
    } finally {
      setLoadingLocation(false);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Bitte gib einen Titel ein');
      return;
    }

    if (!location) {
      setError('Bitte wähle einen Standort');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht eingeloggt');

      const { error } = await supabase.from('spots').insert({
        created_by: user.id,
        title: title.trim(),
        description: description.trim() || null,
        latitude: location.latitude,
        longitude: location.longitude,
        city: city || null,
      });

      if (error) throw error;

      Alert.alert('Erfolg', 'Geheimtipp wurde erstellt!', [
        { text: 'OK', onPress: () => onSuccess?.() },
      ]);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Neuer Geheimtipp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Titel *</Text>
          <Input
            placeholder="z.B. Gemütliches Café in der Altstadt"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Beschreibung</Text>
          <Input
            placeholder="Was macht diesen Ort besonders?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Standort *</Text>

          {location ? (
            <Card style={styles.locationCard} elevated>
              <View style={styles.locationInfo}>
                <MapPin size={20} color={colors.primary[500]} />
                <View style={styles.locationText}>
                  <Text style={styles.locationCoords}>
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </Text>
                  {city && <Text style={styles.locationCity}>{city}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => setLocation(null)}
                  style={styles.removeLocation}
                >
                  <X size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity
              style={styles.locationPicker}
              onPress={handleUseCurrentLocation}
              disabled={loadingLocation}
              activeOpacity={0.7}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <>
                  <Navigation size={24} color={colors.primary[500]} />
                  <Text style={styles.locationPickerText}>Aktuellen Standort verwenden</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            Du kannst auch den Standort auf der Karte wählen (Coming soon)
          </Text>
        </View>

        {/* City Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Stadt (optional)</Text>
          <Input
            placeholder="z.B. Kassel"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Image Upload Placeholder */}
        <View style={styles.section}>
          <Text style={styles.label}>Fotos (coming soon)</Text>
          <TouchableOpacity style={styles.imageUpload} disabled activeOpacity={0.7}>
            <Image size={32} color={colors.neutral[400]} />
            <Text style={styles.imageUploadText}>Foto hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Geheimtipp erstellen"
          onPress={handleSubmit}
          loading={loading}
          disabled={!title || !location}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    gap: spacing[6],
  },
  section: {
    gap: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingVertical: spacing[6],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
  },
  locationPickerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  locationCard: {
    padding: spacing[4],
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  locationText: {
    flex: 1,
  },
  locationCoords: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  locationCity: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  removeLocation: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  imageUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingVertical: spacing[8],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    padding: spacing[4],
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    padding: spacing[6],
    paddingBottom: spacing[8],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});