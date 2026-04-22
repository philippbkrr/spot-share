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
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Button, Input, Card } from './base';
import { MapPin, Navigation, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react-native';

interface Spot {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  image_urls: string[] | null;
}

interface EditSpotScreenProps {
  spot: Spot;
  onClose?: () => void;
  onSuccess?: () => void;
  onDelete?: () => void;
}

interface ImageItem {
  uri: string;
  filename: string;
  isExisting?: boolean;
}

export function EditSpotScreen({ spot, onClose, onSuccess, onDelete }: EditSpotScreenProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(spot.title);
  const [description, setDescription] = useState(spot.description || '');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>({
    latitude: spot.latitude,
    longitude: spot.longitude,
  });
  const [city, setCity] = useState(spot.city || '');
  const [images, setImages] = useState<ImageItem[]>(
    (spot.image_urls || []).map((url) => ({ uri: url, filename: url.split('/').pop() || 'existing', isExisting: true }))
  );
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

  async function handlePickImage() {
    if (images.length >= 5) {
      Alert.alert('Limit', 'Maximal 5 Fotos möglich');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || `photo_${Date.now()}.jpg`;
      setImages([...images, { uri: asset.uri, filename }]);
    }
  }

  async function handleTakePhoto() {
    if (images.length >= 5) {
      Alert.alert('Limit', 'Maximal 5 Fotos möglich');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Kamera-Berechtigung benötigt');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = `photo_${Date.now()}.jpg`;
      setImages([...images, { uri: asset.uri, filename }]);
    }
  }

  function handleRemoveImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  async function uploadNewImages(spotId: string): Promise<string[]> {
    const newImages = images.filter((img) => !img.isExisting);
    if (newImages.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const image of newImages) {
      const ext = image.filename.split('.').pop() || 'jpg';
      const path = `${user?.id}/${spotId}/${Date.now()}_${Math.random()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('spot-images')
        .upload(path, {
          uri: image.uri,
          type: `image/${ext}`,
        });

      if (uploadError) {
        console.log('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('spot-images')
        .getPublicUrl(path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
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
      // Update spot
      const { error: updateError } = await supabase
        .from('spots')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          latitude: location.latitude,
          longitude: location.longitude,
          city: city || null,
        })
        .eq('id', spot.id)
        .eq('created_by', user?.id);

      if (updateError) throw updateError;

      // Upload new images
      const newImageUrls = await uploadNewImages(spot.id);
      const existingUrls = images.filter((img) => img.isExisting).map((img) => img.uri);
      const allUrls = [...existingUrls, ...newImageUrls];

      if (allUrls.length > 0 || images.length === 0) {
        await supabase
          .from('spots')
          .update({ image_urls: allUrls.length > 0 ? allUrls : null })
          .eq('id', spot.id);
      }

      Alert.alert('Erfolg', 'Geheimtipp wurde aktualisiert!', [
        { text: 'OK', onPress: () => onSuccess?.() },
      ]);
    } catch (e: any) {
      setError(e.message || 'Fehler beim Aktualisieren');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Geheimtipp löschen',
      'Bist du sicher, dass du diesen Geheimtipp unwiderruflich löschen möchtest?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete images from storage
              const existingImages = images.filter((img) => img.isExisting);
              for (const img of existingImages) {
                const path = img.filename; // This is the storage path
                await supabase.storage.from('spot-images').remove([path]);
              }

              // Delete spot (reviews + comments cascade)
              const { error } = await supabase
                .from('spots')
                .delete()
                .eq('id', spot.id)
                .eq('created_by', user?.id);

              if (error) throw error;

              onDelete?.();
            } catch (e: any) {
              Alert.alert('Fehler', e.message || 'Konnte nicht gelöscht werden');
            }
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Geheimtipp bearbeiten</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
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

        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Fotos ({images.length}/5)</Text>

          <View style={styles.imageGrid}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Trash2 size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <Plus size={24} color={colors.primary[500]} />
                  <Text style={styles.imageActionText}>Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={24} color={colors.primary[500]} />
                  <Text style={styles.imageActionText}>Galerie</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
          title="Änderungen speichern"
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
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  imageItem: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  imageActionButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  imageActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
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