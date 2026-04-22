import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Card, Badge, StarRating } from './base';
import { MapPin, Plus, Navigation, Layers, X } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Spot {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  avg_rating: number;
  review_count: number;
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

// Default region (Kassel, Germany)
const DEFAULT_REGION = {
  latitude: 51.3127,
  longitude: 9.4797,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function MapScreen({
  onSpotPress,
  onCreateSpot,
  spots = [],
  userLocation,
  loadingLocation,
}: MapScreenProps) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Center on user location when it becomes available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }, 500);
    }
  }, [userLocation]);

  function handleCenterOnUser() {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }

  function handleMapReady() {
    setMapReady(true);
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        } : DEFAULT_REGION}
        onMapReady={handleMapReady}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType="standard"
      >
        {/* Spot Markers */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            onPress={() => onSpotPress?.(spot)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot}>
                <MapPin size={16} color="#fff" />
              </View>
              <View style={styles.markerTail} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Layers size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleCenterOnUser}
        activeOpacity={0.7}
      >
        <Navigation size={20} color={colors.primary[500]} />
      </TouchableOpacity>

      {/* Bottom Sheet with Spot Cards */}
      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Geheimtipps in der Nähe</Text>
          <Badge label={`${spots.length} Orte`} variant="default" />
        </View>

        {/* Spot Cards Horizontal Scroll */}
        <View style={styles.cardsContainer}>
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
                style={styles.spotCardWrapper}
              >
                <Card style={styles.spotCard} elevated>
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
        </View>
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
  map: {
    flex: 1,
  },

  // Marker Styles
  markerContainer: {
    alignItems: 'center',
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent[500],
    marginTop: -2,
  },

  // Controls
  topControls: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
  },
  filterButton: {
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
    bottom: 220,
    right: spacing[4],
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
    ...shadows.xl,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
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
  cardsContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  spotCardWrapper: {
    width: SCREEN_WIDTH * 0.55,
  },
  spotCard: {
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