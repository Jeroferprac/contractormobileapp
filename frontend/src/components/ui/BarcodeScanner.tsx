import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { inventoryApiService } from '../../api/inventoryApi';
import { Product } from '../../types/inventory';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import SuccessModal from '../SuccessModal';
import FailureModal from '../FailureModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string, product?: Product) => void;
  showProductDetails?: boolean;
}

interface ScanResult {
  barcode: string;
  product: Product;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  showProductDetails = false,
}) => {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Camera hooks
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  // Request camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Start scan line animation
  useEffect(() => {
    if (isScanning && visible) {
      const startAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scanLineAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(scanLineAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      };

      startAnimation();
    }
  }, [isScanning, visible, scanLineAnim]);

  // Fade in overlay when modal becomes visible
  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      overlayOpacity.setValue(0);
    }
  }, [visible, overlayOpacity]);

  // Reset scanner when modal opens
  useEffect(() => {
    if (visible) {
      resetScanner();
    }
  }, [visible]);

  // Code scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'code-128',
      'code-39',
      'ean-8',
      'code-93',
      'pdf-417',
      'aztec',
      'data-matrix',
    ],
    onCodeScanned: useCallback(
      async (codes) => {
        if (isScanning && codes.length > 0 && !isLoading && visible) {
        setIsScanning(false);
          setIsLoading(true);
          
        const scannedCode = codes[0];
          
        try {
          if (scannedCode.value) {
            const response = await inventoryApiService.getProductByBarcode(scannedCode.value);
              const product = response.data;
              
              setScannedProduct(product);
              setScanResult({
                barcode: scannedCode.value,
                product,
              });
              
              // Call onScan callback
              onScan(scannedCode.value, product);
              
              // Show success modal if product details are requested
              if (showProductDetails) {
                setShowSuccessModal(true);
              } else {
                // Auto-close after successful scan
                setTimeout(() => {
                  onClose();
                }, 1000);
              }
            }
          } catch (err: any) {
          console.error('Barcode scan API error:', err);
            
            const errorMsg = err.response?.data?.message || 
                           err.message || 
                           'Product not found. Please try scanning again.';
            
            setErrorMessage(errorMsg);
            setShowFailureModal(true);
            
            // Reset scanning state after error
            setTimeout(() => {
              setIsScanning(true);
              setIsLoading(false);
            }, 2000);
          } finally {
            setIsLoading(false);
          }
        }
      },
      [isScanning, isLoading, visible, onScan, showProductDetails]
    ),
  });

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setScanResult(null);
    setScannedProduct(null);
    onClose();
  };

  // Handle failure modal close
  const handleFailureClose = () => {
    setShowFailureModal(false);
    setErrorMessage('');
    setIsScanning(true);
  };

  // Reset scanner
  const resetScanner = () => {
    setScannedProduct(null);
    setScanResult(null);
    setIsScanning(true);
    setIsLoading(false);
  };

  // Toggle torch
  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  // Handle modal close
  const handleClose = () => {
    resetScanner();
    onClose();
  };

  // Permission denied UI
  if (!hasPermission) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <Icon name="camera-off" size={80} color={COLORS.text.secondary} />
          </View>
          
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            This app needs camera access to scan barcodes and QR codes.
          </Text>
          
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // Camera not available UI
  if (!device) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <Icon name="smartphone" size={80} color={COLORS.text.secondary} />
          </View>
          
          <Text style={styles.permissionTitle}>Camera Not Available</Text>
          <Text style={styles.permissionMessage}>
            Your device doesn't have a camera or it's not accessible.
          </Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          
          <TouchableOpacity style={styles.torchButton} onPress={toggleTorch}>
            <Icon 
              name={torchOn ? "zap" : "zap-off"} 
              size={24} 
              color={torchOn ? COLORS.primary : COLORS.text.light} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButtonHeader} onPress={handleClose}>
            <Icon name="x" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
        <Camera
            style={styles.camera}
          device={device}
            isActive={isScanning && visible}
          codeScanner={codeScanner}
          torch={torchOn ? 'on' : 'off'}
        />

          {/* Scanner Overlay */}
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
              {/* Corner Indicators */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              {/* Animated Scan Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionTitle}>
                {isScanning ? 'Position barcode within frame' : 'Processing...'}
              </Text>
              <Text style={styles.instructionText}>
                {isScanning 
                  ? 'Hold steady and ensure good lighting'
                  : 'Please wait while we fetch product details'
                }
            </Text>
          </View>
          </Animated.View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <Icon name="loader" size={32} color={COLORS.primary} />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.primaryButton]} 
            onPress={resetScanner}
            disabled={isLoading}
          >
            <Icon name="refresh-cw" size={20} color={COLORS.text.light} />
            <Text style={styles.primaryButtonText}>Scan Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton} 
            onPress={handleClose}
            disabled={isLoading}
          >
            <Icon name="x" size={20} color={COLORS.text.secondary} />
            <Text style={styles.controlButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          title="Product Found!"
          message={`Successfully scanned: ${scanResult?.product.name}`}
          onClose={handleSuccessClose}
          onAction={handleSuccessClose}
          actionText="Continue"
        />

        {/* Failure Modal */}
        <FailureModal
          visible={showFailureModal}
          title="Scan Failed"
          message={errorMessage}
          onClose={handleFailureClose}
          onAction={handleFailureClose}
          actionText="Try Again"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text.light,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: -80,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  instructionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text.light,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  instructionText: {
    ...TEXT_STYLES.body2,
    color: COLORS.text.light,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.body1,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  bottomControls: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.text.light,
    marginLeft: SPACING.sm,
  },
  controlButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  permissionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  permissionMessage: {
    ...TEXT_STYLES.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  permissionButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.text.light,
  },
  closeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeButtonText: {
    ...TEXT_STYLES.button,
    color: COLORS.text.secondary,
  },
});

export default BarcodeScanner;