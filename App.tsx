import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { MapScreen } from './src/components/MapScreen';
import { DesignSystemPreview } from './src/components/DesignSystemPreview';
import { useLocation } from './src/hooks/useLocation';
import { supabase } from './src/lib/supabase';
import { colors, spacing, typography } from './src/theme/tokens';
import { ActivityIndicator } from 'react-native';

interface Spot {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  avg_rating: number;
  review_count: number;
  created_by: {
    display_name: string | null;
  };
}

export default function App() {
  const { location, loading: loadingLocation } = useLocation();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDesignPreview, setShowDesignPreview] = useState(false);

  // Toggle for development - set to false to see real MapScreen
  const isDevMode = false; // CHANGE THIS TO false TO USE REAL MAP

  useEffect(() => {
    fetchSpots();
  }, []);

  async function fetchSpots() {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          city,
          avg_rating,
          review_count,
          created_by:profiles!created_by(display_name)
        `)
        .limit(20);

      if (error) throw error;
      setSpots(data || []);
    } catch (e) {
      console.log('Fetch spots error:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleSpotPress(spot: Spot) {
    console.log('Spot pressed:', spot.title);
    // Navigate to spot detail
  }

  function handleCreateSpot() {
    console.log('Create new spot');
    // Navigate to create form
  }

  if (isDevMode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <DesignSystemPreview />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>SpotShare wird geladen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <MapScreen
        userLocation={location}
        loadingLocation={loadingLocation}
        spots={spots}
        onSpotPress={handleSpotPress}
        onCreateSpot={handleCreateSpot}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});