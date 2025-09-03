import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface Post {
  id: string;
  caption: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
}

interface PostsTabProps {
  posts: Post[];
  userAvatar?: string;
  userName?: string;
  onCreatePost: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const PostsTab: React.FC<PostsTabProps> = ({ posts, userAvatar, userName, onCreatePost }) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handlePostOptions = (postId: string) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  const renderPostCard = (post: Post) => {
    const isSelected = selectedPostId === post.id;
    
    return (
      <View key={post.id} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <View style={styles.postAvatar}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="business" size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.postUserInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{userName || 'Driven Builders'}</Text>
                                <View style={styles.verificationBadge}>
                  <Icon name="verified" size={14} color="#007BFF" />
                </View>
              </View>
              <Text style={styles.postTimestamp}>{post.timestamp}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.postOptionsButton}
            onPress={() => handlePostOptions(post.id)}
          >
            <Text style={styles.postOptionsIcon}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Post Options Menu */}
        {isSelected && (
          <View style={styles.postOptionsMenu}>
            <TouchableOpacity style={styles.postOption}>
              <Text style={styles.postOptionText}>Edit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postOption}>
              <Text style={styles.postOptionText}>Copy link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postOption}>
              <Text style={styles.postOptionText} style={styles.deleteOptionText}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Post Content */}
        <Text style={styles.postCaption}>{post.caption}</Text>

        {/* Hashtags */}
        <View style={styles.hashtagsContainer}>
          {post.hashtags.map((hashtag, index) => (
            <View key={index} style={styles.hashtag}>
              <Text style={styles.hashtagText}>{hashtag}</Text>
            </View>
          ))}
        </View>

        {/* Post Image */}
        <View style={styles.postImageContainer}>
          <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
          
          {/* Interaction Icons Overlay */}
          <View style={styles.interactionIcons}>
            <View style={styles.interactionItem}>
              <Icon name="favorite" size={20} color="#FF6B6B" />
              <Text style={styles.interactionCount}>5.6k</Text>
            </View>
            <View style={styles.interactionItem}>
              <Icon name="chat-bubble" size={20} color="#4A90E2" />
              <Text style={styles.interactionCount}>1.2k</Text>
            </View>
            <View style={styles.interactionItem}>
              <Icon name="send" size={20} color="#50C878" />
              <Text style={styles.interactionCount}>568</Text>
            </View>
          </View>
        </View>

        {/* Post Stats */}
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Icon name="favorite" size={16} color="#FF6B6B" />
            <Text style={styles.statText}>{post.likes} Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="chat-bubble" size={16} color="#4A90E2" />
            <Text style={styles.statText}>{post.comments} Comments</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="post-add" size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>No posts yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first post to get started</Text>
          <TouchableOpacity style={styles.createPostButton} onPress={onCreatePost}>
            <Text style={styles.createPostButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.postsContainer}>
        {posts.map((post) => renderPostCard(post))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPosts()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  postsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postUserInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: SPACING.xs,
  },
  verificationBadge: {
    marginLeft: 2,
  },
  postTimestamp: {
    fontSize: 14,
    color: '#666666',
  },
  postOptionsButton: {
    padding: SPACING.xs,
  },
  postOptionsIcon: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
  postOptionsMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postOption: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  postOptionText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  deleteOptionText: {
    color: '#DC3545',
  },
  postCaption: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  hashtag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  hashtagText: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '500',
  },
  postImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.sm,
  },
  interactionIcons: {
    position: 'absolute',
    right: SPACING.sm,
    top: SPACING.sm,
    gap: SPACING.md,
  },
  interactionItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    minWidth: 50,
  },
  interactionCount: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '600',
    marginTop: 2,
  },
  postStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#CCCCCC',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createPostButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});