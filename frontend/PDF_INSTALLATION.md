# PDF Viewing Installation Guide

To enable full PDF viewing functionality in the warehouse reports, you need to install additional packages.

## Required Packages

```bash
npm install react-native-html-to-pdf react-native-fs react-native-pdf
```

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install react-native-html-to-pdf react-native-fs react-native-pdf
```

### 2. iOS Setup (if using iOS)
```bash
cd ios
pod install
```

### 3. Android Setup (if using Android)
Add the following to `android/app/build.gradle`:
```gradle
android {
    ...
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}
```

### 4. Rebuild the App
```bash
# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

## Features After Installation

Once installed, you'll be able to:
- ✅ Generate real PDF files from reports
- ✅ View PDFs directly in the app
- ✅ Download PDFs to device storage
- ✅ Share PDFs via email or other apps
- ✅ Print PDFs

## Current Status

The app currently shows a PDF preview with installation instructions. After installing the packages, the PDF viewer will show actual PDF content instead of the preview.

## Troubleshooting

If you encounter issues:

1. **Clean and rebuild:**
   ```bash
   npx react-native clean
   npx react-native start --reset-cache
   ```

2. **For iOS, clean pods:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

3. **For Android, clean gradle:**
   ```bash
   cd android
   ./gradlew clean
   ```
