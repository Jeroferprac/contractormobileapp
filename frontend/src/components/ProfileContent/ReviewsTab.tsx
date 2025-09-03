import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { getCompanyService } from '../../services/serviceFactory';
import { CompanyReview } from '../../services/companyService';

interface ReviewsTabProps {
  reviews?: CompanyReview[];
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews: propReviews }) => {
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (propReviews) {
      setReviews(propReviews);
      setLoading(false);
    } else {
      loadReviews();
    }
  }, [propReviews]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyService = getCompanyService();
      const reviewsData = await companyService.getCompanyReviews();
      setReviews(reviewsData);
    } catch (err: any) {
      console.error('❌ [ReviewsTab] Failed to load reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    try {
              const companyService = getCompanyService();
        const updatedReview = await companyService.replyToReview(reviewId, { reply: replyText });
      
      // Update the local reviews state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId ? updatedReview : review
        )
      );
      
      setReplyingTo(null);
      setReplyText('');
    } catch (err: any) {
      console.error('❌ [ReviewsTab] Failed to reply to review:', err);
      // You could show an error message here
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={16}
          color={i <= rating ? '#FFD700' : '#CCCCCC'}
        />
      );
    }
    return stars;
  };

  const renderReview = (review: CompanyReview) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            {review.customer_avatar_url ? (
              <Icon name="person" size={20} color="#FFFFFF" />
            ) : (
              <Icon name="person" size={20} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{review.customer_name}</Text>
            <Text style={styles.projectName}>{review.project_name}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(review.rating)}
        </View>
      </View>
      
      <Text style={styles.reviewComment}>{review.comment}</Text>
      
      {review.reply && (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Company Reply:</Text>
          <Text style={styles.replyText}>{review.reply}</Text>
          <Text style={styles.replyDate}>{review.reply_date}</Text>
        </View>
      )}
      
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{review.date}</Text>
        {!review.reply && (
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => setReplyingTo(review.id)}
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reply Input */}
      {replyingTo === review.id && (
        <View style={styles.replyInputContainer}>
          <Text style={styles.replyInputLabel}>Write a reply:</Text>
          <View style={styles.replyInputRow}>
            <TouchableOpacity 
              style={styles.sendReplyButton}
              onPress={() => handleReply(review.id)}
            >
              <Text style={styles.sendReplyButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelReplyButton}
              onPress={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
            >
              <Text style={styles.cancelReplyButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="rate-review" size={48} color="#CCCCCC" />
      <Text style={styles.emptyStateText}>No reviews yet</Text>
      <Text style={styles.emptyStateSubtext}>Customer reviews will appear here once they start coming in</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#FF6B35" />
        <Text style={styles.errorText}>Failed to load reviews</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReviews}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {reviews.length > 0 ? (
          reviews.map(renderReview)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 12,
    color: '#666666',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
  },
  replyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  replyContainer: {
    backgroundColor: '#F0F0F0',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: SPACING.xs,
  },
  replyText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  replyDate: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'right',
  },
  replyInputContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  replyInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: SPACING.xs,
  },
  replyInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sendReplyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  sendReplyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelReplyButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  cancelReplyButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
