import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/colors';

interface UnsplashImageProps {
  uri: string;
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  fallbackUri?: string;
  showLoader?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

const UnsplashImage: React.FC<UnsplashImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  fallbackUri,
  showLoader = true,
  onError,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUri, setCurrentUri] = useState(uri);

  const handleError = () => {
    console.log('Image failed to load:', currentUri);
    setHasError(true);
    setIsLoading(false);
    
    // Try fallback URI if available
    if (fallbackUri && currentUri !== fallbackUri) {
      setCurrentUri(fallbackUri);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', currentUri);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  // Clean up Unsplash URL to ensure it works
  const cleanUri = (url: string) => {
    if (!url) return url;
    
    // Ensure HTTPS
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    
    // Add cache busting parameter if not present
    if (!url.includes('&sig=') && !url.includes('&random=')) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}cache=${Date.now()}`;
    }
    
    return url;
  };

  return (
    <View style={[styles.container, style]}>
      <FastImage
        source={{
          uri: cleanUri(currentUri),
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        fallback
      />
      
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      
      {hasError && !isLoading && (
        <View style={styles.errorContainer}>
          <FastImage
            source={{
              uri: 'https://via.placeholder.com/400x300/cccccc/666666?text=Image+Not+Available',
              priority: FastImage.priority.low,
            }}
            style={[styles.image, style]}
            resizeMode={resizeMode}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default UnsplashImage;
