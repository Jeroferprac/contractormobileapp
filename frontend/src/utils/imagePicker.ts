import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export const showImagePickerOptions = (): Promise<ImagePickerResult | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to select your profile picture',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(resolve),
        },
        {
          text: 'Photo Library',
          onPress: () => openImageLibrary(resolve),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ]
    );
  });
};

const openCamera = (resolve: (result: ImagePickerResult | null) => void) => {
  const options = {
    mediaType: 'photo' as MediaType,
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8 as const,
    saveToPhotos: false,
  };

  launchCamera(options, (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      console.log('Camera cancelled or error:', response.errorMessage);
      resolve(null);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri && asset.type && asset.fileName) {
        console.log('📸 [ImagePicker] Camera image selected:', {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          size: asset.fileSize
        });
        resolve({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          size: asset.fileSize || 0,
        });
      } else {
        console.log('❌ [ImagePicker] Camera image missing required fields');
        resolve(null);
      }
    } else {
      console.log('❌ [ImagePicker] No camera image selected');
      resolve(null);
    }
  });
};

const openImageLibrary = (resolve: (result: ImagePickerResult | null) => void) => {
  const options = {
    mediaType: 'photo' as MediaType,
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8 as const,
    selectionLimit: 1,
  };

  launchImageLibrary(options, (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      console.log('Image library cancelled or error:', response.errorMessage);
      resolve(null);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri && asset.type && asset.fileName) {
        console.log('📸 [ImagePicker] Library image selected:', {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          size: asset.fileSize
        });
        resolve({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
          size: asset.fileSize || 0,
        });
      } else {
        console.log('❌ [ImagePicker] Library image missing required fields');
        resolve(null);
      }
    } else {
      console.log('❌ [ImagePicker] No library image selected');
      resolve(null);
    }
  });
};

export const createFormDataForAvatar = (imageResult: ImagePickerResult): FormData => {
  console.log('📁 [ImagePicker] Creating FormData for avatar upload...');
  console.log('📁 [ImagePicker] Image result:', imageResult);
  
  // Defensive check for valid imageResult
  if (!imageResult || !imageResult.uri) {
    console.error('❌ [ImagePicker] Invalid imageResult provided:', imageResult);
    throw new Error('Invalid image data provided. Please try selecting an image again.');
  }
  
  try {
    console.log('📁 [ImagePicker] Creating new FormData...');
    const formData = new FormData();
    console.log('📁 [ImagePicker] FormData created:', formData);
    
    // Ensure proper file object structure for React Native
    const fileObject = {
      uri: Platform.OS === 'ios' ? imageResult.uri.replace('file://', '') : imageResult.uri,
      type: imageResult.type || 'image/jpeg',
      name: imageResult.name || 'avatar.jpg',
    };
    
    console.log('📁 [ImagePicker] File object:', fileObject);
    console.log('📁 [ImagePicker] Platform:', Platform.OS);
    console.log('📁 [ImagePicker] Original URI:', imageResult.uri);
    console.log('📁 [ImagePicker] Processed URI:', fileObject.uri);
    
    console.log('📁 [ImagePicker] Appending file to FormData...');
    // Append the file to FormData with 'avatar_file' field name (backend expects this)
    formData.append('avatar_file', fileObject as any);
    console.log('📁 [ImagePicker] File appended successfully');
    
    console.log('📁 [ImagePicker] FormData created successfully');
    console.log('📁 [ImagePicker] FormData field name: avatar_file');
    console.log('📁 [ImagePicker] FormData type:', typeof formData);
    console.log('📁 [ImagePicker] FormData constructor:', formData.constructor.name);

    return formData;
  } catch (error) {
    console.error('❌ [ImagePicker] FormData creation failed:', error);
    throw new Error('Failed to create form data for image upload. Please try again.');
  }
};

export const validateImageSize = (size: number, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
};

export const validateImageType = (type: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(type.toLowerCase());
};

// Direct function to open image library without showing options
export const openImageLibraryDirect = (): Promise<ImagePickerResult | null> => {
  return new Promise((resolve) => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        console.log('Image library cancelled or error:', response.errorMessage);
        resolve(null);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          console.log('📸 [ImagePicker] Library image selected:', {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
            size: asset.fileSize
          });
          resolve({
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
            size: asset.fileSize || 0,
          });
        } else {
          console.log('❌ [ImagePicker] Library image missing required fields');
          resolve(null);
        }
      } else {
        console.log('❌ [ImagePicker] No library image selected');
        resolve(null);
      }
    });
  });
};

// Function to open file dialog using image picker with specific options
export const openFileDialog = (): Promise<ImagePickerResult | null> => {
  return new Promise((resolve) => {
    console.log('📁 [ImagePicker] Opening file dialog...');
    
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
      selectionLimit: 1,
      includeExtra: true,
      presentationStyle: 'fullScreen' as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        console.log('File dialog cancelled or error:', response.errorMessage);
        resolve(null);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          console.log('📁 [ImagePicker] File selected:', {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
            size: asset.fileSize
          });
          resolve({
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName,
            size: asset.fileSize || 0,
          });
        } else {
          console.log('❌ [ImagePicker] File missing required fields');
          resolve(null);
        }
      } else {
        console.log('❌ [ImagePicker] No file selected');
        resolve(null);
      }
    });
  });
};
