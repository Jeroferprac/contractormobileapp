import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface CreatePostScreenProps {
  onPost: () => void;
  onBack: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  onPost,
  onBack,
}) => {
  const [postText, setPostText] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={onPost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Icon name="person" size={24} color={COLORS.text.secondary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userHandle}>@john_builders</Text>
          </View>
        </View>

        {/* Post Input */}
        <View style={styles.postInputContainer}>
          <TextInput
            style={styles.postInput}
            placeholder="What do you want to talk about..."
            placeholderTextColor={COLORS.text.secondary}
            value={postText}
            onChangeText={setPostText}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="image" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="videocam" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="location-on" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Icon name="emoji-emotions" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  postButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  userHandle: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  postInputContainer: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  postInput: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    minHeight: 200,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});