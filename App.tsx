import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { MapScreen } from './src/components/MapScreen';
import { AuthScreen } from './src/components/AuthScreen';
import { CreateSpotScreen } from './src/components/CreateSpotScreen';
import { useAuth } from './src/hooks/useAuth';
import { useLocation } from './src/hooks/useLocation';
import { supabase } from './src/lib/supabase';
import { colors, spacing, typography } from './src/theme/tokens';
import { X } from 'lucide-react-native';

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
  const { user, loading: authLoading } = useAuth();
  const { location, loading: locationLoading } = useLocation();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [fetchingSpots, setFetchingSpots] = useState(true);
  const [showCreateSpot, setShowCreateSpot] = useState(false);

  React.useEffect(() => {
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
      setFetchingSpots(false);
    }
  }

  function handleAuthSuccess() {
    console.log('Auth successful');
  }

  function handleSpotPress(spot: Spot) {
    console.log('Spot pressed:', spot.title);
  }

  function handleCreateSpot() {
    setShowCreateSpot(true);
  }

  function handleCreateSpotClose() {
    setShowCreateSpot(false);
  }

  function handleCreateSpotSuccess() {
    setShowCreateSpot(false);
    fetchSpots(); // Refresh spots list
  }

  // Show loading state while checking auth
  if (authLoading || locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {authLoading ? 'Auth wird geprüft...' : 'Standort wird ermittelt...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </SafeAreaView>
    );
  }

  // Show main app (map) when logged in
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <MapScreen
        userLocation={location}
        loadingLocation={false}
        spots={spots}
        onSpotPress={handleSpotPress}
        onCreateSpot={handleCreateSpot}
      />

      {/* Create Spot Modal */}
      <Modal
        visible={showCreateSpot}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCreateSpotClose}
      >
        <CreateSpotScreen
          onClose={handleCreateSpotClose}
          onSuccess={handleCreateSpotSuccess}
          initialLocation={location}
        />
      </Modal>
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