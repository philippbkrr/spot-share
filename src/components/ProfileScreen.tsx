import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Card, Avatar, Badge, StarRating, Button } from './base';
import {
  MapPin,
  Settings,
  LogOut,
  Plus,
  Edit2,
  ChevronRight,
  Award,
  MessageCircle,
  Star,
} from 'lucide-react-native';

interface Spot {
  id: string;
  title: string;
  city: string | null;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

interface ProfileScreenProps {
  onClose?: () => void;
  onEditProfile?: () => void;
  onMySpotPress?: (spot: Spot) => void;
}

export function ProfileScreen({ onClose, onEditProfile, onMySpotPress }: ProfileScreenProps) {
  const { user, profile, signOut } = useAuth();
  const [mySpots, setMySpots] = useState<Spot[]>([]);
  const [stats, setStats] = useState({
    totalSpots: 0,
    totalReviews: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMySpots();
      fetchStats();
    }
  }, [user]);

  async function fetchMySpots() {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          id,
          title,
          city,
          avg_rating,
          review_count,
          created_at
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMySpots(data || []);
    } catch (e) {
      console.log('Error fetching my spots:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    if (!user) return;

    try {
      // Get review count
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get comment count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalSpots: mySpots.length,
        totalReviews: reviewCount || 0,
        totalComments: commentCount || 0,
      });
    } catch (e) {
      console.log('Error fetching stats:', e);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            onClose?.();
          },
        },
      ]
    );
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
  }

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <Text>Du bist nicht eingeloggt</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronRight size={24} color={colors.textPrimary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={() => {}} style={styles.settingsButton}>
          <Settings size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard} elevated>
          <View style={styles.profileHeader}>
            <Avatar
              name={profile.display_name || profile.username || 'User'}
              size="lg"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {profile.display_name || profile.username}
              </Text>
              <Text style={styles.username}>@{profile.username}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
              <Edit2 size={18} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {stats.totalSpots >= 1 && (
              <Badge
                label={`${stats.totalSpots} Geheimtipps`}
                variant="default"
              />
            )}
            {stats.totalReviews >= 1 && (
              <Badge
                label={`${stats.totalReviews} Bewertungen`}
                variant="default"
              />
            )}
            {stats.totalComments >= 1 && (
              <Badge
                label={`${stats.totalComments} Kommentare`}
                variant="default"
              />
            )}
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <MapPin size={24} color={colors.primary[500]} />
            <Text style={styles.statNumber}>{stats.totalSpots}</Text>
            <Text style={styles.statLabel}>Geheimtipps</Text>
          </Card>
          <Card style={styles.statCard}>
            <Star size={24} color={colors.accent[500]} />
            <Text style={styles.statNumber}>{stats.totalReviews}</Text>
            <Text style={styles.statLabel}>Bewertungen</Text>
          </Card>
          <Card style={styles.statCard}>
            <MessageCircle size={24} color={colors.info} />
            <Text style={styles.statNumber}>{stats.totalComments}</Text>
            <Text style={styles.statLabel}>Kommentare</Text>
          </Card>
        </View>

        {/* My Spots Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meine Geheimtipps</Text>
            <TouchableOpacity style={styles.addSpotButton} onPress={() => {}}>
              <Plus size={16} color={colors.primary[500]} />
              <Text style={styles.addSpotText}>Neuer</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
          ) : mySpots.length === 0 ? (
            <Card>
              <View style={styles.emptyState}>
                <MapPin size={40} color={colors.neutral[300]} />
                <Text style={styles.emptyStateText}>Noch keine Geheimtipps</Text>
                <Text style={styles.emptyStateSubtext}>
                  Teile deinen ersten Geheimtipp!
                </Text>
              </View>
            </Card>
          ) : (
            <View style={styles.spotsList}>
              {mySpots.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  onPress={() => onMySpotPress?.(spot)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.spotCard}>
                    <View style={styles.spotInfo}>
                      <Text style={styles.spotTitle}>{spot.title}</Text>
                      {spot.city && (
                        <Text style={styles.spotCity}>{spot.city}</Text>
                      )}
                      <View style={styles.spotMeta}>
                        <StarRating rating={Math.round(spot.avg_rating || 0)} size={12} />
                        <Text style={styles.spotRating}>
                          ({(spot.avg_rating || 0).toFixed(1)})
                        </Text>
                        <Text style={styles.spotReviews}>
                          {spot.review_count} Bewertungen
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Button
            title="Abmelden"
            variant="outline"
            onPress={handleSignOut}
            icon={<LogOut size={18} color={colors.error} />}
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </View>
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
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[6],
  },
  profileCard: {
    gap: spacing[4],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  username: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    gap: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  addSpotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
  },
  addSpotText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  loadingContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  spotsList: {
    gap: spacing[3],
  },
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  spotInfo: {
    flex: 1,
    gap: spacing[1],
  },
  spotTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
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
  spotRating: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  spotReviews: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  signOutSection: {
    marginTop: spacing[4],
  },
  signOutButton: {
    borderColor: colors.error,
  },
});