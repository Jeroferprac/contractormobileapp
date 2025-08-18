import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Rect } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* iOS-style SVG Background */}
      <Svg style={styles.backgroundSvg} width="100%" height="100%">
        <Defs>
          <LinearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.primary + '10'} />
            <Stop offset="100%" stopColor={COLORS.primary + '05'} />
          </LinearGradient>
          <LinearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.secondary + '08'} />
            <Stop offset="100%" stopColor={COLORS.secondary + '03'} />
          </LinearGradient>
        </Defs>
        
        {/* Background gradient */}
        <Rect width="100%" height="100%" fill="url(#gradient1)" />
        
        {/* Floating circles */}
        <Circle cx="20%" cy="15%" r="60" fill="url(#gradient2)" opacity="0.6" />
        <Circle cx="80%" cy="25%" r="40" fill="url(#gradient1)" opacity="0.4" />
        <Circle cx="10%" cy="70%" r="50" fill="url(#gradient2)" opacity="0.3" />
        <Circle cx="85%" cy="80%" r="35" fill="url(#gradient1)" opacity="0.5" />
        <Circle cx="50%" cy="10%" r="25" fill="url(#gradient2)" opacity="0.4" />
        <Circle cx="70%" cy="60%" r="30" fill="url(#gradient1)" opacity="0.3" />
      </Svg>
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default BackgroundPattern;
