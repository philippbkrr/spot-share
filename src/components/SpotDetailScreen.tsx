import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { Card, Avatar, Badge, StarRating, Button, Input } from './base';
import { MapPin, Calendar, User, MessageCircle, ThumbsUp, Flag, Share2, ChevronLeft, Send } from 'lucide-react-native';

interface SpotDetailScreenProps {
  spot: {
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
    created_by: {
      display_name: string | null;
      username: string;
    };
  };
  onClose?: () => void;
  onReviewAdded?: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    username: string;
  };
}

export function SpotDetailScreen({ spot, onClose, onReviewAdded }: SpotDetailScreenProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showComments, setShowComments] = useState(false);

  React.useEffect(() => {
    fetchReviews();
    fetchComments();
  }, [spot.id]);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles:user_id(display_name, username)
        `)
        .eq('spot_id', spot.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if current user has reviewed
      if (user) {
        const userReview = data?.find((r) => r.user_id === user.id);
        setHasReviewed(!!userReview);
      }

      setReviews(data || []);
    } catch (e) {
      console.log('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(display_name, username)
        `)
        .eq('spot_id', spot.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (e) {
      console.log('Error fetching comments:', e);
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim()) return;
    if (!user) {
      Alert.alert('Fehler', 'Du musst eingeloggt sein');
      return;
    }

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from('comments').insert({
        spot_id: spot.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (e: any) {
      Alert.alert('Fehler', e.message || 'Kommentar konnte nicht gespeichert werden');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleSubmitReview() {
    if (newRating === 0) {
      Alert.alert('Fehler', 'Bitte wähle eine Bewertung');
      return;
    }

    if (!user) {
      Alert.alert('Fehler', 'Du musst eingeloggt sein');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        spot_id: spot.id,
        user_id: user.id,
        rating: newRating,
        comment: newReview.trim() || null,
      });

      if (error) throw error;

      setNewReview('');
      setNewRating(0);
      setHasReviewed(true);
      fetchReviews();
      onReviewAdded?.();
    } catch (e: any) {
      Alert.alert('Fehler', e.message || 'Review konnte nicht gespeichert werden');
    } finally {
      setSubmittingReview(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{spot.title}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Placeholder for spot image */}
          <View style={styles.imagePlaceholder}>
            <MapPin size={48} color={colors.neutral[400]} />
          </View>

          {/* Spot Info */}
          <View style={styles.spotInfo}>
            <Text style={styles.spotTitle}>{spot.title}</Text>
            {spot.city && (
              <View style={styles.locationRow}>
                <MapPin size={16} color={colors.textMuted} />
                <Text style={styles.locationText}>{spot.city}</Text>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.ratingContainer}>
                <StarRating rating={Math.round(spot.avg_rating || 0)} size={16} />
                <Text style={styles.ratingText}>
                  {(spot.avg_rating || 0).toFixed(1)}
                </Text>
                <Text style={styles.reviewCountText}>
                  ({spot.review_count} Bewertungen)
                </Text>
              </View>
            </View>

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  Erstellt am {formatDate(spot.created_at)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <User size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  von {spot.created_by?.display_name || spot.created_by?.username || 'Unbekannt'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {spot.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beschreibung</Text>
            <Card>
              <Text style={styles.descriptionText}>{spot.description}</Text>
            </Card>
          </View>
        )}

        {/* Write Review */}
        {user && !hasReviewed && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bewertung schreiben</Text>
            <Card elevated>
              <View style={styles.reviewForm}>
                <Text style={styles.ratingLabel}>Wie bewertest du diesen Ort?</Text>
                <StarRating
                  rating={newRating}
                  size={32}
                  onRate={setNewRating}
                />

                <View style={styles.commentInputContainer}>
                  <Input
                    placeholder="Schreib etwas über diesen Ort (optional)..."
                    value={newReview}
                    onChangeText={setNewReview}
                    multiline
                    numberOfLines={3}
                    style={styles.commentInput}
                  />
                </View>

                <Button
                  title="Bewertung absenden"
                  onPress={handleSubmitReview}
                  loading={submittingReview}
                  disabled={newRating === 0}
                />
              </View>
            </Card>
          </View>
        )}

        {hasReviewed && user && (
          <View style={styles.section}>
            <Card style={styles.reviewedCard}>
              <ThumbsUp size={20} color={colors.success} />
              <Text style={styles.reviewedText}>Du hast diesen Ort bewertet</Text>
            </Card>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Bewertungen ({reviews.length})
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
          ) : reviews.length === 0 ? (
            <Card>
              <View style={styles.emptyReviews}>
                <MessageCircle size={32} color={colors.neutral[300]} />
                <Text style={styles.emptyText}>Noch keine Bewertungen</Text>
                <Text style={styles.emptySubtext}>
                  Sei der Erste, der diesen Ort bewertet!
                </Text>
              </View>
            </Card>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Avatar
                      name={review.profiles?.display_name || review.profiles?.username || 'User'}
                      size="sm"
                    />
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewerName}>
                        {review.profiles?.display_name || review.profiles?.username || 'User'}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {formatDate(review.created_at)}
                      </Text>
                    </View>
                    <StarRating rating={review.rating} size={14} />
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.commentsHeader}
            onPress={() => setShowComments(!showComments)}
          >
            <View style={styles.commentsTitleRow}>
              <MessageCircle size={20} color={colors.textPrimary} />
              <Text style={styles.sectionTitle}>Kommentare ({comments.length})</Text>
            </View>
          </TouchableOpacity>

          {/* Comment Input */}
          {user && (
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Schreibe einen Kommentar..."
                placeholderTextColor={colors.textMuted}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment}
                style={[
                  styles.sendCommentButton,
                  !newComment.trim() && styles.sendCommentButtonDisabled,
                ]}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                  <Send size={20} color={newComment.trim() ? colors.primary[500] : colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Comments List */}
          {showComments && (
            <View style={styles.commentsList}>
              {comments.length === 0 ? (
                <Text style={styles.noCommentsText}>Noch keine Kommentare</Text>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Avatar
                      name={comment.profiles?.display_name || comment.profiles?.username || 'User'}
                      size="sm"
                    />
                    <View style={styles.commentBubble}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {comment.profiles?.display_name || comment.profiles?.username || 'User'}
                        </Text>
                        <Text style={styles.commentDate}>
                          {formatDate(comment.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerAction} activeOpacity={0.7}>
          <ThumbsUp size={20} color={colors.textSecondary} />
          <Text style={styles.footerActionText}>Nützlich</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction} activeOpacity={0.7}>
          <Flag size={20} color={colors.textSecondary} />
          <Text style={styles.footerActionText}>Melden</Text>
        </TouchableOpacity>
      </View>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  heroSection: {
    backgroundColor: colors.surface,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotInfo: {
    padding: spacing[6],
    gap: spacing[3],
  },
  spotTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  statsRow: {
    marginTop: spacing[2],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  ratingText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  reviewCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
    marginTop: spacing[2],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: spacing[6],
    marginTop: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  reviewForm: {
    gap: spacing[4],
  },
  ratingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  commentInputContainer: {
    marginTop: spacing[2],
  },
  commentInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reviewedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.success + '15',
  },
  reviewedText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  reviewsList: {
    gap: spacing[4],
  },
  reviewCard: {
    gap: spacing[3],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  reviewMeta: {
    flex: 1,
  },
  reviewerName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  reviewDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  reviewComment: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[8],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  footerActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  commentsHeader: {
    marginBottom: spacing[3],
  },
  commentsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
  },
  commentTextInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendCommentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentButtonDisabled: {
    opacity: 0.5,
  },
  commentsList: {
    gap: spacing[4],
  },
  noCommentsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  commentItem: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  commentAuthor: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  commentDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  commentContent: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
});