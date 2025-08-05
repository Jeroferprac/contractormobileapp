import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { Service } from '../../data/mockData';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  style?: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  style,
}) => {
  const isViewMore = service.title === 'View More';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isViewMore && styles.viewMoreContainer,
        style
      ]} 
      onPress={onPress}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: service.image }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Badge */}
        {service.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{service.badge}</Text>
          </View>
        )}
        
        {/* View More Overlay */}
        {isViewMore && (
          <View style={styles.viewMoreOverlay}>
            <View style={styles.viewMoreIcon}>
              <Icon name="arrow-up-right" size={20} color={COLORS.secondary} />
            </View>
          </View>
        )}
      </View>
      
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, isViewMore && styles.viewMoreTitle]}>
          {service.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 110,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewMoreContainer: {
    backgroundColor: COLORS.text.primary,
  },
  imageContainer: {
    width: '100%',
    height: 80,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  viewMoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMoreIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.text.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  viewMoreTitle: {
    color: COLORS.text.light,
  },
});

export default ServiceCard; 