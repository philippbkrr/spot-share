import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { MapScreen } from './src/components/MapScreen';
import { AuthScreen } from './src/components/AuthScreen';
import { CreateSpotScreen } from './src/components/CreateSpotScreen';
import { SpotDetailScreen } from './src/components/SpotDetailScreen';
import { EditSpotScreen } from './src/components/EditSpotScreen';
import { ProfileScreen } from './src/components/ProfileScreen';
import { useAuth } from './src/hooks/useAuth';
import { useLocation } from './src/hooks/useLocation';
import { supabase } from './src/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from './src/theme/tokens';
import { User } from 'lucide-react-native';

interface Spot {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  created_at: string;
  avg_rating: number;
  review_count: number;
  view_count: number;
  image_urls: string[] | null;
  created_by: {
    display_name: string | null;
    username: string;
  };
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { location, loading: locationLoading } = useLocation();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [fetchingSpots, setFetchingSpots] = useState(true);
  const [showCreateSpot, setShowCreateSpot] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [showEditSpot, setShowEditSpot] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);

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
          created_at,
          avg_rating,
          review_count,
          view_count,
          image_urls,
          created_by:profiles!created_by(display_name, username)
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

  function handleSpotPress(spot: Spot) {
    setSelectedSpot(spot);
  }

  function handleSpotDetailClose() {
    setSelectedSpot(null);
  }

  function handleSpotDetailEdit(spot: Spot) {
    setEditingSpot(spot);
    setShowEditSpot(true);
  }

  function handleSpotDetailReviewAdded() {
    fetchSpots();
  }

  function handleCreateSpot() {
    setShowCreateSpot(true);
  }

  function handleCreateSpotClose() {
    setShowCreateSpot(false);
  }

  function handleCreateSpotSuccess() {
    setShowCreateSpot(false);
    fetchSpots();
  }

  function handleProfileClose() {
    setShowProfile(false);
  }

  function handleProfileSpotPress(spot: Spot) {
    setShowProfile(false);
    setSelectedSpot(spot);
  }

  function handleEditSpotClose() {
    setShowEditSpot(false);
    setEditingSpot(null);
  }

  function handleEditSpotSuccess() {
    setShowEditSpot(false);
    setEditingSpot(null);
    fetchSpots();
    setSelectedSpot(null);
  }

  function handleEditSpotDelete() {
    setShowEditSpot(false);
    setEditingSpot(null);
    setSelectedSpot(null);
    fetchSpots();
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
        <AuthScreen onAuthSuccess={() => {}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Profile Button (fixed top right) */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setShowProfile(true)}
        activeOpacity={0.7}
      >
        <User size={22} color={colors.textSecondary} />
      </TouchableOpacity>

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

      {/* Spot Detail Modal */}
      <Modal
        visible={!!selectedSpot}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleSpotDetailClose}
      >
        {selectedSpot && (
          <SpotDetailScreen
            spot={selectedSpot}
            onClose={handleSpotDetailClose}
            onEdit={() => handleSpotDetailEdit(selectedSpot)}
            onReviewAdded={handleSpotDetailReviewAdded}
          />
        )}
      </Modal>

      {/* Edit Spot Modal */}
      <Modal
        visible={showEditSpot}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleEditSpotClose}
      >
        {editingSpot && (
          <EditSpotScreen
            spot={editingSpot}
            onClose={handleEditSpotClose}
            onSuccess={handleEditSpotSuccess}
            onDelete={handleEditSpotDelete}
          />
        )}
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleProfileClose}
      >
        <ProfileScreen
          onClose={handleProfileClose}
          onMySpotPress={handleProfileSpotPress}
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
  profileButton: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
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