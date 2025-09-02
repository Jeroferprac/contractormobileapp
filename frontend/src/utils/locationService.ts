import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Location obtained:', { latitude, longitude });
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error('❌ Location error:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please enable location services or enter address manually.',
          [{ text: 'OK' }]
        );
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

/**
 * Reverse geocode coordinates to address
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // For now, return coordinates as address to avoid API key requirement
    // You can integrate Google Maps API later with a proper API key
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    return `${latitude}, ${longitude}`;
  }
};

/**
 * Get formatted location string
 */
export const getFormattedLocation = async (): Promise<string> => {
  try {
    const location = await getCurrentLocation();
    const address = await getAddressFromCoordinates(location.latitude, location.longitude);
    return address;
  } catch (error) {
    console.error('❌ Error getting formatted location:', error);
    return '';
  }
};
