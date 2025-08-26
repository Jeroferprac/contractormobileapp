import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../components';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { OnboardingScreenNavigationProp } from '../types/navigation';

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

const onboardingData = [
  {
    id: 1,
    title: 'Turn Your Space into Something Extraordinary',
    description:
      'Explore design ideas, get inspired, and connect with top-tier professionals to bring your dream home to life.',
    icon: 'home',
    iconType: 'feather',
  },
  {
    id: 2,
    title: 'Plumbers, Electricians & More — All Nearby',
    description:
      'Need a quick fix or a major upgrade? Find trusted local experts for every job, big or small, right when you need them.',
    icon: 'build',
    iconType: 'material',
  },
  {
    id: 3,
    title: 'Book Home Services, All in One App',
    description:
      'From design to delivery — compare reviews, chat with pros, and book your next project hassle-free.',
    icon: 'phone',
    iconType: 'feather',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const renderIcon = (iconName: string, iconType: string, size: number = 80) => {
    if (iconType === 'material') {
      return <MaterialIcon name={iconName} size={size} color={COLORS.primary} />;
    }
    return <Icon name={iconName} size={size} color={COLORS.primary} />;
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {renderIcon(currentSlide.icon, currentSlide.iconType)}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="gradient"
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xxl,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border.light,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  nextButton: {
    width: '100%',
  },
});
