import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Batch, CreateBatchRequest, UpdateBatchRequest } from '../api/batchesApi';
import batchesApiService from '../api/batchesApi';

interface EditBatchScreenProps {
  navigation: any;
  route: {
    params: {
      batch?: Batch;
      isEditing: boolean;
    };
  };
}

const EditBatchScreen: React.FC<EditBatchScreenProps> = ({ navigation, route }) => {
  const { batch, isEditing } = route.params;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: batch?.name || '',
    description: batch?.description || '',
    batch_number: batch?.batch_number || '',
    status: batch?.status || 'active' as 'active' | 'inactive' | 'completed' | 'pending',
    currency: batch?.currency || 'USD',
    category: batch?.category || '',
    is_active: batch?.is_active ?? true,
  });

  const handleBackPress = () => {
    console.log('🔙 Back button pressed');
    if (form.name || form.description || form.batch_number) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            console.log('🔙 Navigating back after discard');
            navigation.goBack();
          }},
        ]
      );
    } else {
      console.log('🔙 Navigating back directly');
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.batch_number.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && batch) {
        const updateData: UpdateBatchRequest = {
          name: form.name,
          description: form.description,
          batch_number: form.batch_number,
          status: form.status,
          currency: form.currency,
          category: form.category,
          is_active: form.is_active,
        };
        await batchesApiService.updateBatch(batch.id, updateData);
        Alert.alert('Success', 'Batch updated successfully');
      } else {
        const createData: CreateBatchRequest = {
          name: form.name,
          description: form.description,
          batch_number: form.batch_number,
          status: form.status,
          currency: form.currency,
          category: form.category,
        };
        await batchesApiService.createBatch(createData);
        Alert.alert('Success', 'Batch created successfully');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving batch:', error);
      Alert.alert('Error', 'Failed to save batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'CAD', value: 'CAD' },
  ];

  const categoryOptions = [
    { label: 'Production', value: 'Production' },
    { label: 'Quality Control', value: 'Quality Control' },
    { label: 'Samples', value: 'Samples' },
    { label: 'Rework', value: 'Rework' },
    { label: 'Export', value: 'Export' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Saving batch...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.8}

          >
            <Icon name="arrow-left" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Batch' : 'Create Batch'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update batch information' : 'Add a new batch'}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form */}
        <View style={styles.formSection}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Batch Name *</Text>
            <Input
              placeholder="Enter batch name"
              value={form.name}
              onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Batch Number *</Text>
            <Input
              placeholder="Enter batch number"
              value={form.batch_number}
              onChangeText={(text) => setForm(prev => ({ ...prev, batch_number: text }))}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <Input
              placeholder="Enter batch description"
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.optionsContainer}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    form.status === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, status: option.value as any }))}
                >
                  <Text style={[
                    styles.optionText,
                    form.status === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionsContainer}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    form.category === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, category: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    form.category === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.optionsContainer}>
              {currencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    form.currency === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, currency: option.value }))}
                >
                  <Text style={[
                    styles.optionText,
                    form.currency === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isEditing && (
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Active Status</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    { backgroundColor: form.is_active ? COLORS.primary : COLORS.border.light }
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: form.is_active ? 20 : 0 }] }
                  ]} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={isEditing ? 'Update Batch' : 'Create Batch'}
            onPress={handleSubmit}
            loading={loading}
            size="medium"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  headerGradient: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.light,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  placeholder: {
    width: 42,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  formSection: {
    marginTop: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.card,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.white,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
});

export default EditBatchScreen;
