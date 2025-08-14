import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface CreateStoryScreenProps {
  onSend: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const CreateStoryScreen: React.FC<CreateStoryScreenProps> = ({
  onSend,
  onBack,
  onNext,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const recentImages = [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Story</Text>
        <TouchableOpacity onPress={selectedImage ? onSend : onNext} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>{selectedImage ? 'Send' : 'Next'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedImage ? (
          // Story Creation View
          <View style={styles.storyCreationContainer}>
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Write Caption"
                placeholderTextColor={COLORS.text.secondary}
                value={caption}
                onChangeText={setCaption}

              />
            </View>
          </View>
        ) : (
          // Image Selection View
          <View style={styles.imageSelectionContainer}>
            <View style={styles.mainImageContainer}>
              <Image
                source={{ uri: recentImages[0] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </View>
            
            <Text style={styles.recentImagesTitle}>Recent Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentImagesContainer}>
              {recentImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentImageItem}
                  onPress={() => setSelectedImage(image)}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.recentImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Action Icons */}
      <View style={styles.actionIcons}>
        <TouchableOpacity style={styles.actionIcon}>
          <Icon name="camera-alt" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon}>
          <Icon name="photo-library" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        {selectedImage && (
          <TouchableOpacity style={styles.actionIcon} onPress={() => setSelectedImage(null)}>
            <Icon name="close" size={24} color={COLORS.status.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Toolbar (only in story creation view) */}
      {selectedImage && (
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
      )}
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
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  imageSelectionContainer: {
    flex: 1,
  },
  mainImageContainer: {
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  recentImagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  recentImagesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  recentImageItem: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  storyCreationContainer: {
    flex: 1,
  },
  imagePreviewContainer: {
    height: 400,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  changePhotoText: {
    color: COLORS.text.light,
    fontSize: 14,
    fontWeight: '500',
  },
  captionContainer: {
    marginBottom: SPACING.lg,
  },
  captionInput: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    minHeight: 100,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.lg,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
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