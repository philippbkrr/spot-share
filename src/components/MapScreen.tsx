import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useLocation } from '../hooks/useLocation';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Card, Badge, StarRating, Avatar } from './base';
import { MapPin, Plus, Navigation, Layers } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Spot {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  avg_rating: number;
  review_count: number;
  city: string | null;
  image_url: string | null;
  created_by: {
    display_name: string | null;
  };
}

interface MapScreenProps {
  onSpotPress?: (spot: Spot) => void;
  onCreateSpot?: () => void;
  spots?: Spot[];
  userLocation?: { latitude: number; longitude: number } | null;
  loadingLocation?: boolean;
}

export function MapScreen({
  onSpotPress,
  onCreateSpot,
  spots = [],
  userLocation,
  loadingLocation,
}: MapScreenProps) {
  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapContainer}>
        {/* Map Background with Grid Pattern */}
        <View style={styles.mapBackground}>
          {/* Grid Lines */}
          <View style={styles.gridOverlay}>
            {[...Array(6)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, styles.gridLineHorizontal, { top: `${(i + 1) * 16.66}%` }]} />
            ))}
            {[...Array(4)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, styles.gridLineVertical, { left: `${(i + 1) * 25}%` }]} />
            ))}
          </View>

          {/* User Location Marker */}
          {loadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.loadingText}>Standort wird ermittelt...</Text>
            </View>
          ) : userLocation ? (
            <View style={styles.userMarkerContainer}>
              {/* Pulsing ring */}
              <View style={styles.pulseRing} />
              {/* Main dot */}
              <View style={styles.userDot} />
              {/* Accuracy circle */}
              <View style={styles.accuracyCircle} />
            </View>
          ) : (
            <View style={styles.noLocationContainer}>
              <Navigation size={32} color={colors.textMuted} />
              <Text style={styles.noLocationText}>Standort nicht verfügbar</Text>
              <TouchableOpacity style={styles.retryButton}>
                <Text style={styles.retryText}>Erneut versuchen</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mock Map Markers for Demo */}
          {spots.length > 0 && spots.map((spot, index) => (
            <TouchableOpacity
              key={spot.id}
              style={[
                styles.spotMarker,
                {
                  left: `${20 + (index * 25) % 60}%`,
                  top: `${30 + (index * 17) % 40}%`,
                },
              ]}
              onPress={() => onSpotPress?.(spot)}
              activeOpacity={0.8}
            >
              <View style={styles.markerPin}>
                <MapPin size={20} color="#fff" />
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerLabelText} numberOfLines={1}>
                  {spot.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} activeOpacity={0.7}>
            <Layers size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* My Location Button */}
        {userLocation && (
          <TouchableOpacity style={styles.myLocationButton} activeOpacity={0.7}>
            <Navigation size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        )}

        {/* Map Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>OpenStreetMap</Text>
        </View>
      </View>

      {/* Spots List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Geheimtipps in der Nähe</Text>
          <Badge label={`${spots.length} Orte`} variant="default" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotCardsContainer}
        >
          {spots.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={40} color={colors.neutral[300]} />
              <Text style={styles.emptyStateText}>Noch keine Geheimtipps</Text>
              <Text style={styles.emptyStateSubtext}>
                Sei der Erste und teile einen Ort!
              </Text>
            </View>
          ) : (
            spots.map((spot) => (
              <TouchableOpacity
                key={spot.id}
                onPress={() => onSpotPress?.(spot)}
                activeOpacity={0.8}
              >
                <Card style={styles.spotCard}>
                  {/* Placeholder Image */}
                  <View style={styles.spotImagePlaceholder}>
                    <MapPin size={24} color={colors.neutral[400]} />
                  </View>
                  <View style={styles.spotInfo}>
                    <Text style={styles.spotTitle} numberOfLines={1}>
                      {spot.title}
                    </Text>
                    {spot.city && (
                      <Text style={styles.spotCity} numberOfLines={1}>
                        {spot.city}
                      </Text>
                    )}
                    <View style={styles.spotMeta}>
                      <StarRating rating={Math.round(spot.avg_rating || 0)} size={12} />
                      <Text style={styles.reviewCount}>
                        ({spot.review_count || 0})
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Create Spot FAB */}
      <TouchableOpacity
        style={styles.createFab}
        onPress={onCreateSpot}
        activeOpacity={0.85}
      >
        <Plus size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Map Styles
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#e8e4df',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  gridLineHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineVertical: {
    top: 0,
    bottom: 0,
    width: 1,
  },

  // User Location
  loadingContainer: {
    alignItems: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  noLocationContainer: {
    alignItems: 'center',
    gap: spacing[3],
  },
  noLocationText: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
  },
  retryButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
  },
  retryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    opacity: 0.25,
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary[500],
    borderWidth: 3,
    borderColor: '#fff',
    ...shadows.md,
  },
  accuracyCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(45, 138, 94, 0.3)',
    backgroundColor: 'rgba(45, 138, 94, 0.05)',
  },

  // Spot Markers
  spotMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  markerLabel: {
    marginTop: spacing[1],
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    maxWidth: 100,
    ...shadows.sm,
  },
  markerLabelText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },

  // Map Controls
  mapControls: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    gap: spacing[2],
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: spacing[4],
    right: spacing[4],
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  attribution: {
    position: 'absolute',
    bottom: spacing[2],
    left: spacing[3],
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  attributionText: {
    fontSize: 10,
    color: colors.textMuted,
  },

  // List Styles
  listContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -borderRadius.xl,
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
    ...shadows.lg,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  listTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  spotCardsContainer: {
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  spotCard: {
    width: SCREEN_WIDTH * 0.55,
    padding: 0,
    overflow: 'hidden',
  },
  spotImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotInfo: {
    padding: spacing[4],
    gap: spacing[1],
  },
  spotTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  spotCity: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  spotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  reviewCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  emptyState: {
    width: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing[2],
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // FAB
  createFab: {
    position: 'absolute',
    bottom: spacing[6],
    left: spacing[6],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
});