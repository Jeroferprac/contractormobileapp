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

interface CreateHighlightScreenProps {
  onAdd: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const CreateHighlightScreen: React.FC<CreateHighlightScreenProps> = ({
  onAdd,
  onBack,
  onNext,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [highlightTitle, setHighlightTitle] = useState('');

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
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Highlight</Text>
        <TouchableOpacity onPress={selectedImage ? onAdd : onNext} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>{selectedImage ? 'Add' : 'Next'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedImage ? (
          // Highlight Creation View
          <View style={styles.highlightCreationContainer}>
            <View style={styles.coverSelectionContainer}>
              <View style={styles.coverPreview}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.editCoverButton}>
                  <Icon name="camera-alt" size={20} color={COLORS.textLight} />
                  <Text style={styles.editCoverText}>Edit cover</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.titleContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Highlights"
                placeholderTextColor={COLORS.textSecondary}
                value={highlightTitle}
                onChangeText={setHighlightTitle}
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
            <Icon name="close" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
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
    color: COLORS.textPrimary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonText: {
    color: COLORS.textLight,
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
    color: COLORS.textPrimary,
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
  highlightCreationContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  coverSelectionContainer: {
    marginBottom: SPACING.xl,
  },
  coverPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  editCoverButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  editCoverText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '500',
  },
  titleContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  titleInput: {
    fontSize: 18,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
}); 