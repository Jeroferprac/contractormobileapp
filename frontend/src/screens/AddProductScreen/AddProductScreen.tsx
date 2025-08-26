import React, { useState, useRef, useEffect } from 'react';
import inventoryApiService from '../../api/inventoryApi';
// import LottieView from 'lottie-react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { Product } from '../../types/inventory';

interface AddProductScreenProps {
  navigation: any;
  route: {
    params?: {
      product?: Product;
    };
  };
}

const AddProductScreen: React.FC<AddProductScreenProps> = ({ navigation, route }) => {
  const editingProduct = route.params?.product;
  const isEditing = !!editingProduct;

  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_name: '',
    brand: '',
    unit: '',
    current_stock: '',
    min_stock_level: '',
    reorder_point: '',
    max_stock_level: '',
    cost_price: '',
    selling_price: '',
    description: '',
    weight: '',
    dimensions: '',
    is_active: true,
    track_serial: false,
    track_batch: false,
    is_composite: false,
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        barcode: editingProduct.barcode || '',
        category_name: editingProduct.category_name || '',
        brand: editingProduct.brand || '',
        unit: editingProduct.unit || '',
        current_stock: editingProduct.current_stock?.toString() || '',
        min_stock_level: editingProduct.min_stock_level?.toString() || '',
        reorder_point: editingProduct.reorder_point?.toString() || '',
        max_stock_level: editingProduct.max_stock_level?.toString() || '',
        cost_price: editingProduct.cost_price?.toString() || '',
        selling_price: editingProduct.selling_price?.toString() || '',
        description: editingProduct.description || '',
        weight: editingProduct.weight || '',
        dimensions: editingProduct.dimensions || '',
        is_active: editingProduct.is_active || true,
        track_serial: editingProduct.track_serial || false,
        track_batch: editingProduct.track_batch || false,
        is_composite: editingProduct.is_composite || false,
      });
    }
  }, [editingProduct]);

  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const successScale = useSharedValue(0);

  const [failureVisible, setFailureVisible] = useState(false);
  const failureScale = useSharedValue(0);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isEditing && editingProduct) {
        await inventoryApiService.updateProduct(editingProduct.id, form);
      } else {
        await inventoryApiService.createProduct(form);
      }
      setSaving(false);
      setSuccessVisible(true);
      successScale.value = 0;
      successScale.value = withSpring(1, {
        damping: 6,
        stiffness: 80,
      });
    } catch (error) {
      setSaving(false);
      setFailureVisible(true);
      failureScale.value = 0;
      failureScale.value = withSpring(1, {
        damping: 6,
        stiffness: 80,
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    navigation.goBack();
  };

  const handleFailureClose = () => {
    setFailureVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Image */}
      <View style={styles.header}>
        <View style={styles.headerImage}>
          <View style={styles.headerOverlay}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Product' : 'Add Product'}
            </Text>
            
            <View style={{width: 40}} />
          </View>
        </View>
      </View>
      
      {/* Form Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formCard}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={form.name}
                onChangeText={(v) => handleChange('name', v)}
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>SKU</Text>
              <TextInput
                style={styles.input}
                placeholder="SKU"
                value={form.sku}
                onChangeText={(v) => handleChange('sku', v)}
              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Barcode</Text>
              <TextInput
                style={styles.input}
                placeholder="Barcode"
                value={form.barcode}
                onChangeText={(v) => handleChange('barcode', v)}
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Category"
                value={form.category_name}
                onChangeText={(v) => handleChange('category_name', v)}
              />
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="Brand"
                value={form.brand}
                onChangeText={(v) => handleChange('brand', v)}
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                placeholder="Unit"
                value={form.unit}
                onChangeText={(v) => handleChange('unit', v)}
              />
            </View>
          </View>

          {/* Row 4 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Current Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="Current Stock"
                value={String(form.current_stock)}
                onChangeText={(v) => handleChange('current_stock', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>Min Stock Level</Text>
              <TextInput
                style={styles.input}
                placeholder="Min Stock Level"
                value={String(form.min_stock_level)}
                onChangeText={(v) => handleChange('min_stock_level', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Row 5 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Reorder Point</Text>
              <TextInput
                style={styles.input}
                placeholder="Reorder Point"
                value={String(form.reorder_point)}
                onChangeText={(v) => handleChange('reorder_point', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>Max Stock Level</Text>
              <TextInput
                style={styles.input}
                placeholder="Max Stock Level"
                value={String(form.max_stock_level)}
                onChangeText={(v) => handleChange('max_stock_level', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Row 6 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Cost Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Cost Price"
                value={String(form.cost_price)}
                onChangeText={(v) => handleChange('cost_price', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>Selling Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Selling Price"
                value={String(form.selling_price)}
                onChangeText={(v) => handleChange('selling_price', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Row 7 */}
          <View style={styles.row}>
            <View style={[styles.inputHalf, styles.inputLeft]}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                value={form.weight}
                onChangeText={(v) => handleChange('weight', v)}
              />
            </View>
            <View style={[styles.inputHalf, styles.inputRight]}>
              <Text style={styles.label}>Dimensions</Text>
              <TextInput
                style={styles.input}
                placeholder="Dimensions"
                value={form.dimensions}
                onChangeText={(v) => handleChange('dimensions', v)}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputContainerFull}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Description"
              value={form.description}
              onChangeText={(v) => handleChange('description', v)}
              multiline={true}
            />
          </View>

          {/* Switches - two-column layout */}
          <View style={styles.switchSection}>
            <Text style={styles.sectionTitle}>Product Options</Text>
            
            <View style={styles.switchGridRow}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Active</Text>
                <Switch 
                  value={form.is_active} 
                  onValueChange={(v) => handleChange('is_active', v)}
                  trackColor={{ false: '#E5E7EB', true: '#FF6B35' }}
                  thumbColor={form.is_active ? '#fff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Track Serial</Text>
                <Switch 
                  value={form.track_serial} 
                  onValueChange={(v) => handleChange('track_serial', v)}
                  trackColor={{ false: '#E5E7EB', true: '#FF6B35' }}
                  thumbColor={form.track_serial ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.switchGridRow}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Track Batch</Text>
                <Switch 
                  value={form.track_batch} 
                  onValueChange={(v) => handleChange('track_batch', v)}
                  trackColor={{ false: '#E5E7EB', true: '#FF6B35' }}
                  thumbColor={form.track_batch ? '#fff' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Composite</Text>
                <Switch 
                  value={form.is_composite} 
                  onValueChange={(v) => handleChange('is_composite', v)}
                  trackColor={{ false: '#E5E7EB', true: '#FF6B35' }}
                  thumbColor={form.is_composite ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Icon name="x" size={20} color={COLORS.text.primary} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Icon name="check" size={20} color={COLORS.text.light} />
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={handleSuccessClose}>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}> 
            <TouchableOpacity style={styles.successClose} onPress={handleSuccessClose}>
              <Icon name="x" size={22} color="#111827" />
            </TouchableOpacity>

            <View style={styles.successIconCircle}>
              <View style={{ width: 80, height: 80, backgroundColor: '#10B981', borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="check" size={40} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.successTitle}>Successful!</Text>
            <Text style={styles.successMessage}>
              {isEditing ? 'Product updated successfully.' : 'Product added successfully.'}
            </Text>

            <TouchableOpacity style={styles.successAction} onPress={handleSuccessClose}>
              <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.successActionGradient}>
                <Text style={styles.successActionText}>Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Failure Modal */}
      <Modal visible={failureVisible} transparent animationType="fade" onRequestClose={handleFailureClose}>
        <View style={styles.failureOverlay}>
          <Animated.View style={[styles.failureCard, { transform: [{ scale: failureScale }] }]}>
            <TouchableOpacity style={styles.failureClose} onPress={handleFailureClose}>
              <Icon name="x" size={22} color="#111827" />
            </TouchableOpacity>

            <View style={styles.failureIconCircle}>
              <View style={{ width: 80, height: 80, backgroundColor: '#EF4444', borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="x" size={40} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.failureTitle}>Failed!</Text>
            <Text style={styles.failureMessage}>
              {isEditing ? 'Failed to update product.' : 'Failed to add product.'} Please try again.
            </Text>

            <TouchableOpacity style={styles.failureAction} onPress={handleFailureClose}>
              <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.failureActionGradient}>
                <Text style={styles.failureActionText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  headerImageStyle: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.lg : SPACING.xxxl,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.light,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for bottom buttons
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  inputHalf: {
    flex: 1,
  },
  inputLeft: {
    marginRight: SPACING.sm,
  },
  inputRight: {
    marginLeft: SPACING.sm,
  },
  inputContainerFull: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    color: COLORS.text.secondary,
  },
  input: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: COLORS.text.primary,
  },
  switchSection: {
    marginTop: SPACING.md,
  },
  switchGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginHorizontal: SPACING.xs,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  // Success modal styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  successCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  successClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 10,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E', // Green color for success
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  successAction: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  successActionGradient: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successActionText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  // Failure modal styles
  failureOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  failureCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  failureClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 10,
  },
  failureIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444', // Red color for failure
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  failureTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  failureMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  failureAction: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  failureActionGradient: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failureActionText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddProductScreen;
