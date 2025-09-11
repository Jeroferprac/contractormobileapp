import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { TEXT_STYLES } from '../constants/typography';
import { OnboardingScreenNavigationProp } from '../types/navigation';

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Turn Your Space into Something Extraordinary',
    description: 'Explore design ideas, get inspired, and connect with top-tier professionals to bring your dream home to life.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1200&fit=crop&crop=center',
    backgroundColor: '#FFFFFF',
  },
  {
    id: 2,
    title: 'Plumbers, Electricians & More — All Nearby',
    description: 'Need a quick fix or a major upgrade? Find trusted local experts for every job, big or small, right when you need them.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=1200&fit=crop&crop=center',
    backgroundColor: '#FFFFFF',
  },
  {
    id: 3,
    title: 'Book Home Services, All in One App',
    description: 'From design to delivery — compare reviews, chat with pros, and book your next project hassle-free.',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=1200&fit=crop&crop=center',
    backgroundColor: '#FFFFFF',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      // Fade out current content
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
      setCurrentIndex(currentIndex + 1);
        // Fade in new content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const handleDotPress = (index: number) => {
    if (index !== currentIndex) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(index);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={currentSlide.backgroundColor} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Image Section with Fade Effect */}
        <View style={styles.imageContainer}>
          <FastImage 
            source={{ 
              uri: currentSlide.imageUrl,
              priority: FastImage.priority.high,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
          {/* Subtle Fade Effect to match Figma */}
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
            locations={[0, 0.3, 0.6, 0.85, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.fadeGradient}
          />
        </View>

        {/* Text Content Section */}
        <View style={styles.textContainer}>
          <Animated.View style={[styles.textContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
                index < currentIndex && styles.completedDot
              ]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={['#FB7504', '#C2252C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    ...TEXT_STYLES.body1,
    color: '#FB7504',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.6,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    // backgroundColor: 'transparent', // This is handled by the LinearGradient
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  textContent: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'left',
    fontWeight: '700',
    lineHeight: 36,
  },
  description: {
    ...TEXT_STYLES.body1,
    color: '#6C757D',
    textAlign: 'left',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
    marginRight: 12,
  },
  activeDot: {
    backgroundColor: '#FB7504',
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  completedDot: {
    backgroundColor: '#FB7504',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...TEXT_STYLES.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

