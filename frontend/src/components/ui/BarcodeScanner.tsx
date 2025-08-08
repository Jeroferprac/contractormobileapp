import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner
} from 'react-native-vision-camera';
import { inventoryApiService } from '../../api/inventoryApi';
import { Product } from '../../types/inventory';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128', 'code-39', 'ean-8', 'code-93', 'pdf-417', 'aztec', 'data-matrix'],
    onCodeScanned: async (codes) => {
      if (isScanning && codes.length > 0) {
        setIsScanning(false);
        const scannedCode = codes[0];
        // Call API to get product by barcode
        try {
          const response = await inventoryApiService.getProductByBarcode(scannedCode.value);
          setScannedProduct(response.data);
          onScan(scannedCode.value);
        } catch (err) {
          setError('Product not found or API error.');
          console.error('Barcode scan API error:', err);
        }
      }
    }
  });

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <Text style={styles.permissionText}>Camera not found</Text>
        </View>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <Text style={styles.permissionText}>{error}</Text>
          <TouchableOpacity onPress={onClose} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (scannedProduct) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Product Found</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.productDetailsContainer}>
            <Text style={styles.productName}>{scannedProduct.name}</Text>
            <Text style={styles.productInfo}>SKU: {scannedProduct.sku}</Text>
            <Text style={styles.productInfo}>Category: {scannedProduct.category_name}</Text>
            <Text style={styles.productInfo}>Price: ${parseFloat(scannedProduct.selling_price as string).toFixed(2)}</Text>
            <Text style={styles.productInfo}>Current Stock: {scannedProduct.current_stock}</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={onClose}>
            <Text style={styles.scanButtonText}>Done</Text>
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
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan Barcode</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={visible && isScanning}
          codeScanner={codeScanner}
          torch={torchOn ? 'on' : 'off'}
        />

        {/* Overlay UI */}
        <View style={styles.overlay}>
          <View style={styles.scannerFrame}>
            <Text style={styles.scannerText}>
              {isScanning ? 'Scanning...' : 'Position barcode within frame'}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setIsScanning(true)}
          >
            <Icon name="camera" size={24} color={COLORS.text.light} />
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Icon name="flashlight" size={20} color={COLORS.text.secondary} />
            <Text style={styles.manualButtonText}>Toggle Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manualButton} onPress={onClose}>
            <Icon name="x-circle" size={20} color={COLORS.text.secondary} />
            <Text style={styles.manualButtonText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>
            • Hold your device steady{'\n'}
            • Position barcode in the center{'\n'}
            • Ensure good lighting{'\n'}
            • Keep barcode flat and clean
          </Text>
        </View>
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  productDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  productInfo: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  permissionText: {
    color: COLORS.text.primary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  scannerText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  controls: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light,
    marginLeft: SPACING.sm,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  manualButtonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  instructions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default BarcodeScanner;