import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import { Professional } from '../../data/mockData';

interface ProfessionalCardProps {
  professional: Professional;
  onPress: () => void;
  style?: any;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {/* Background Image */}
      {professional.backgroundImage && (
        <FastImage
          source={{ uri: professional.backgroundImage }}
          style={styles.backgroundImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      
      {/* Content Overlay */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <FastImage
              source={{ uri: professional.logo }}
              style={styles.logo}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
          
          {/* Tag */}
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{professional.tag}</Text>
          </View>
        </View>
        
        {/* Professional Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{professional.name}</Text>
            {professional.verified && (
              <Icon name="check-circle" size={16} color={COLORS.status.verified} />
            )}
          </View>
          
          {/* Rating */}
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={COLORS.secondary} />
            <Text style={styles.rating}>{professional.rating} ({professional.reviews})</Text>
          </View>
          
          {/* Location */}
          <View style={styles.locationRow}>
            <Icon name="map-pin" size={12} color={COLORS.text.secondary} />
            <Text style={styles.location}>{professional.location}</Text>
          </View>
          
          {/* Category */}
          <View style={styles.categoryRow}>
            <Icon name="star" size={12} color={COLORS.text.secondary} />
            <Text style={styles.category}>{professional.category}</Text>
          </View>
        </View>
        
        {/* Skills */}
        <View style={styles.skills}>
          {professional.skills.slice(0, 2).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {professional.skills.length > 2 && (
            <View style={styles.moreTag}>
              <Text style={styles.moreText}>+{professional.skills.length - 2}</Text>
            </View>
          )}
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
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  tagContainer: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.dark,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  rating: {
    fontSize: 12,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillText: {
    fontSize: 10,
    color: COLORS.text.primary,
  },
  moreTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moreText: {
    fontSize: 10,
    color: COLORS.text.light,
    fontWeight: '600',
  },
});

export default ProfessionalCard; 