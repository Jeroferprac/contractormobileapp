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
  onCreatePost: () => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({ posts, onCreatePost }) => {
  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Icon name="person" size={24} color={COLORS.text.secondary} />
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.postAuthor}>John Doe</Text>
          <Text style={styles.postTimestamp}>Today, 2:13PM</Text>
        </View>
      </View>

      {/* Post Caption */}
      <Text style={styles.postCaption}>Just Finished overseeing a major renovation project in downtown Abu Dhabi. The transformation is incredible</Text>
      <Text style={styles.postHashtags}>#RealEstate #Construction</Text>

      {/* Post Image */}
      <View style={styles.postImageContainer}>
        <FastImage
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="favorite-border" size={20} color={COLORS.text.secondary} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chat-bubble-outline" size={20} color={COLORS.text.secondary} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={20} color={COLORS.text.secondary} />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Action Buttons Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.circularActionButton}>
          <Icon name="add" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Add Highlights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularActionButton}>
          <Icon name="people" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Team</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularActionButton}>
          <Icon name="description" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>New project</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circularActionButton}>
          <Icon name="location-on" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Site Visit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.map(renderPost)}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={onCreatePost}>
        <Icon name="add" size={24} color={COLORS.text.light} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  circularActionButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  postTimestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  postCaption: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  postHashtags: {
    fontSize: 12,
    color: COLORS.primary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  postImageContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});