# Fix Image Picker Issue

The error `TypeError: Cannot read property 'launchImageLibrary' of null` indicates that the `react-native-image-picker` library is not properly linked.

## Quick Fix Steps:

### 1. Clean and Reinstall
```bash
cd frontend
npm install
# or
yarn install
```

### 2. For Android - Clean Build
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 3. For iOS - Clean Build
```bash
cd ios
rm -rf build
pod install
cd ..
npx react-native run-ios
```

### 4. If the above doesn't work, try reinstalling the library:
```bash
npm uninstall react-native-image-picker
npm install react-native-image-picker
```

### 5. For Android - Manual Linking (if needed)
Add to `android/settings.gradle`:
```gradle
include ':react-native-image-picker'
project(':react-native-image-picker').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-image-picker/android')
```

Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation project(':react-native-image-picker')
}
```

Add to `android/app/src/main/java/com/frontend/MainApplication.java`:
```java
import com.imagepicker.ImagePickerPackage;

// In getPackages() method:
packages.add(new ImagePickerPackage());
```

### 6. Alternative: Use Expo Image Picker
If the above doesn't work, consider switching to `expo-image-picker`:
```bash
npm uninstall react-native-image-picker
npm install expo-image-picker
```

Then update the import in ProfileEditScreen.tsx:
```typescript
import * as ImagePicker from 'expo-image-picker';
```

## Test the Fix
After following the steps above, try clicking the camera icon again. The image picker should now work properly.
