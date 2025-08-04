import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '../../constants/spacing';

interface HorizontalScrollProps {
  children: React.ReactNode;
  style?: any;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    // Enable horizontal scrolling by making content wider than screen
    minWidth: '100%',
  },
});

export default HorizontalScroll; 