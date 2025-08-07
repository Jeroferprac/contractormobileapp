import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { Project } from '../../data/mockData';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onHeartPress: () => void;
  onBookmarkPress: () => void;
  style?: any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  onHeartPress,
  onBookmarkPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: project.image }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onHeartPress}>
            <Icon name="heart" size={16} color={COLORS.text.light} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onBookmarkPress}>
            <Icon name="bookmark" size={16} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>
        
        {/* Arrow Icon */}
        <View style={styles.arrowButton}>
          <Icon name="arrow-up-right" size={16} color={COLORS.text.light} />
        </View>
      </View>
      
      {/* Banner Overlay */}
      <View style={styles.bannerOverlay}>
        <View style={styles.bannerContent}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{project.company}</Text>
            <Text style={styles.location}>{project.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 200,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.overlay.card,
    padding: SPACING.md,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.light,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: 12,
    color: COLORS.text.light,
    opacity: 0.8,
  },
});

export default ProjectCard; 