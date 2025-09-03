import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Text as SvgText, G } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';

interface BestOfBinyaanServiceProps {
  onEditPress?: () => void;
}

export const BestOfBinyaanService: React.FC<BestOfBinyaanServiceProps> = ({ onEditPress }) => {
  // Perfect hexagonal path with precise coordinates
  const hexagonPath = "M40 5 L75 25 L75 75 L40 95 L5 75 L5 25 Z";
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Best Of Binyaan Service</Text>
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.badgesContainer}>
        {/* 2024 Badge - Perfect Hexagon */}
        <View style={styles.badgeContainer}>
          <Svg width="80" height="100" viewBox="0 0 80 100">
            <Path d={hexagonPath} fill="#FFE4B5" stroke="#FF8C42" strokeWidth="2.5" />
            {/* Stars - perfectly aligned */}
            <G>
              <SvgText x="22" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="32" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="42" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="52" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
            </G>
            {/* Year 2024 - perfectly centered */}
            <SvgText x="40" y="60" fontSize="24" fontWeight="bold" fill="#FF6B35" textAnchor="middle">2024</SvgText>
            {/* Banner - perfectly aligned */}
            <Path d="M5 75 L75 75 L75 95 L5 95 Z" fill="#FF6B35" />
            <SvgText x="40" y="90" fontSize="12" fontWeight="600" fill="white" textAnchor="middle">Best Services</SvgText>
          </Svg>
        </View>

        {/* 2025 Badge - Perfect Hexagon */}
        <View style={styles.badgeContainer}>
          <Svg width="80" height="100" viewBox="0 0 80 100">
            <Path d={hexagonPath} fill="#1A1A1A" stroke="#FFD700" strokeWidth="2.5" />
            {/* Stars - perfectly aligned */}
            <G>
              <SvgText x="18" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="28" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="38" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="48" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="58" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
            </G>
            {/* Year 2025 - perfectly centered */}
            <SvgText x="40" y="60" fontSize="24" fontWeight="bold" fill="#FFD700" textAnchor="middle">2025</SvgText>
            {/* Banner - perfectly aligned */}
            <Path d="M5 75 L75 75 L75 95 L5 95 Z" fill="#FFD700" />
            <SvgText x="40" y="90" fontSize="12" fontWeight="600" fill="white" textAnchor="middle">Best Services</SvgText>
          </Svg>
        </View>

        {/* 2023 Badge - Perfect Hexagon */}
        <View style={styles.badgeContainer}>
          <Svg width="80" height="100" viewBox="0 0 80 100">
            <Path d={hexagonPath} fill="#FFE4B5" stroke="#FF8C42" strokeWidth="2.5" />
            {/* Stars - perfectly aligned */}
            <G>
              <SvgText x="18" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="28" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="38" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="48" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
              <SvgText x="58" y="28" fontSize="12" fill="#FFD700">⭐</SvgText>
            </G>
            {/* Year 2023 - perfectly centered */}
            <SvgText x="40" y="60" fontSize="24" fontWeight="bold" fill="#FF6B35" textAnchor="middle">2023</SvgText>
            {/* Banner - perfectly aligned */}
            <Path d="M5 75 L75 75 L75 95 L5 95 Z" fill="#FF6B35" />
            <SvgText x="40" y="90" fontSize="12" fontWeight="600" fill="white" textAnchor="middle">Best Services</SvgText>
          </Svg>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  editButton: {
    padding: SPACING.xs,
  },
  editIcon: {
    fontSize: 16,
    color: '#FF6B35',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 100,
  },
});
