import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface Post {
  id: string;
  caption: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

interface PostsTabProps {
  posts: Post[];
  userAvatar?: string;
  userName?: string;
  onCreatePost: () => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({ posts, userAvatar, userName, onCreatePost }) => {
  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          {userAvatar ? (
            <FastImage
              source={{ uri: userAvatar }}
              style={styles.postAvatarImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.postAvatarPlaceholder}>
              <Icon name="person" size={20} color={COLORS.text.secondary} />
            </View>
          )}
        </View>
        <View style={styles.postInfo}>
          <View style={styles.postAuthorContainer}>
            <Text style={styles.postAuthor}>{userName || 'User'}</Text>
            <Icon name="verified" size={14} color="#2196F3" style={styles.verifiedIcon} />
          </View>
          <Text style={styles.postTimestamp}>{post.timestamp}</Text>
        </View>
        <TouchableOpacity style={styles.postMenu}>
          <Icon name="more-vert" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Post Caption */}
      <Text style={styles.postCaption}>{post.caption}</Text>
      


      {/* Post Image */}
      <View style={styles.postImageContainer}>
        <FastImage
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Engagement Icons Overlay */}
        <View style={styles.engagementOverlay}>
          <TouchableOpacity style={styles.engagementIcon}>
            <Icon name="favorite" size={20} color="#FF6B6B" />
            <Text style={styles.engagementText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementIcon}>
            <Icon name="chat-bubble-outline" size={20} color="#FFFFFF" />
            <Text style={styles.engagementText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementIcon}>
            <Icon name="send" size={20} color="#FFFFFF" />
            <Text style={styles.engagementText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.length > 0 ? (
          posts.map(renderPost)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="post-add" size={48} color={COLORS.text.secondary} />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first post to get started</Text>
            <TouchableOpacity style={styles.createPostButton} onPress={onCreatePost}>
              <Text style={styles.createPostButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  postCard: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  postAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  postInfo: {
    flex: 1,
  },
  postAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  postTimestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  postMenu: {
    padding: SPACING.xs,
  },
  postCaption: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  hashtag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  hashtagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  postImageContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: BORDER_RADIUS.md,
  },
  engagementOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  engagementIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: SPACING.xs,
    alignItems: 'center',
    minWidth: 40,
  },
  engagementText: {
    fontSize: 8,
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
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
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createPostButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  createPostButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },

});