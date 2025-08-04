import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { LinearGradient } from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import { Discount } from '../../data/mockData';

interface DiscountBannerProps {
  discount: Discount;
  onPress?: () => void;
  style?: any;
}

const DiscountBanner: React.FC<DiscountBannerProps> = ({
  discount,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <LinearGradient
        colors={COLORS.gradient.discount}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
                 <View style={styles.content}>
           <View style={styles.textContainer}>
             <Text style={styles.title}>{discount.title}</Text>
             <Text style={styles.description}>{discount.description}</Text>
             <Text style={styles.discountText}>{discount.discount}</Text>
           </View>
           <View style={styles.imageContainer}>
             <FastImage
               source={{ uri: discount.image }}
               style={styles.image}
               resizeMode={FastImage.resizeMode.cover}
             />
           </View>
         </View>
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  title: {
    fontSize: TEXT_STYLES.h4.fontSize,
    fontWeight: TEXT_STYLES.h4.fontWeight,
    color: COLORS.text.light,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TEXT_STYLES.body.fontSize,
    color: COLORS.text.light,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  discountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.light,
    opacity: 0.3,
  },
  dotActive: {
    opacity: 1,
  },
});

export default DiscountBanner; 