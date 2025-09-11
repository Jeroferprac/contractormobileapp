import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { inventoryApiService } from '../../../../api/inventoryApi';
import { Warehouse, WarehouseCreate, WarehouseUpdate } from '../../../../types/inventory';
import { COLORS } from '../../../../constants/colors';
import { FORM_STYLES, FORM_COLORS, INPUT_ICONS } from '../../../../constants/formStyles';
import SuccessModal from '../../../SuccessModal';
import FailureModal from '../../../FailureModal';

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onSuccess: () => void;
  onCancel: () => void;
  mode: 'create' | 'update';
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  warehouse,
  onSuccess,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<WarehouseCreate>({
    name: '',
    code: '',
    address: '',
    contact_person: '',
    phone: '',
    email: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');

  useEffect(() => {
    if (warehouse && mode === 'update') {
      setFormData({
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        contact_person: warehouse.contact_person,
        phone: warehouse.phone,
        email: warehouse.email,
        is_active: warehouse.is_active,
      });
    }
  }, [warehouse, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Warehouse name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Warehouse code is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Contact person is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await inventoryApiService.createWarehouse(formData);
        setSuccessMessage('Warehouse created successfully!');
        setShowSuccessModal(true);
      } else if (warehouse) {
        await inventoryApiService.updateWarehouse(warehouse.id, formData);
        setSuccessMessage('Warehouse updated successfully!');
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Warehouse form error:', error);
      setFailureMessage(error.response?.data?.detail || 'Failed to save warehouse. Please check your connection and try again.');
      setShowFailureModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
  };

  const handleFailureModalAction = () => {
    setShowFailureModal(false);
    // Optionally retry the operation
    // handleSubmit();
  };

  const updateField = (field: keyof WarehouseCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderInputField = (
    field: keyof WarehouseCreate,
    label: string,
    placeholder: string,
    icon: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    multiline: boolean = false
  ) => (
    <View style={FORM_STYLES.inputContainer}>
      <Text style={FORM_STYLES.inputLabel}>{label}</Text>
      <View style={[
          FORM_STYLES.inputWrapper,
          errors[field] && FORM_STYLES.inputWrapperError,
        ]}>
        <Icon name={icon} size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
        <TextInput
          style={[FORM_STYLES.input, multiline && FORM_STYLES.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={FORM_COLORS.text.tertiary}
          value={formData[field] as string}
          onChangeText={(value) => updateField(field, value)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
      {errors[field] && <Text style={FORM_STYLES.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={FORM_STYLES.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={FORM_COLORS.background} />
      <View style={FORM_STYLES.container}>
        <View style={FORM_STYLES.header}>
          <TouchableOpacity onPress={onCancel} style={FORM_STYLES.backButton}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={FORM_STYLES.headerTitle}>
            {mode === 'create' ? 'Create Warehouse' : 'Update Warehouse'}
          </Text>
          <View style={FORM_STYLES.headerSpacer} />
        </View>

             <ScrollView style={FORM_STYLES.scrollView} showsVerticalScrollIndicator={false}>
         <View style={FORM_STYLES.scrollContent}>
           {/* Basic Information Card */}
           <View style={FORM_STYLES.card}>
             <View style={FORM_STYLES.cardHeader}>
               <Icon name="warehouse" size={24} color={FORM_COLORS.primary} />
               <Text style={FORM_STYLES.cardTitle}>Basic Information</Text>
             </View>
             
             {renderInputField('name', 'Warehouse Name', 'Enter warehouse name', 'home')}
             {renderInputField('code', 'Warehouse Code', 'Enter warehouse code', 'hash')}
             {renderInputField('address', 'Address', 'Enter warehouse address', 'map-marker', 'default', true)}
           </View>

           {/* Contact Information Card */}
           <View style={FORM_STYLES.card}>
             <View style={FORM_STYLES.cardHeader}>
               <Icon name="account" size={24} color={FORM_COLORS.primary} />
               <Text style={FORM_STYLES.cardTitle}>Contact Information</Text>
             </View>
             
             {renderInputField('contact_person', 'Contact Person', 'Enter contact person name', 'account')}
             {renderInputField('phone', 'Phone Number', 'Enter phone number', 'phone', 'phone-pad')}
             {renderInputField('email', 'Email Address', 'Enter email address', 'email', 'email-address')}
           </View>

           {/* Status Card */}
           <View style={FORM_STYLES.card}>
             <View style={FORM_STYLES.cardHeader}>
               <Icon name="toggle-switch" size={24} color={FORM_COLORS.primary} />
               <Text style={FORM_STYLES.cardTitle}>Status</Text>
             </View>
             
             <View style={FORM_STYLES.toggleContainer}>
               <View style={FORM_STYLES.toggleLabelContainer}>
                 <Icon name="check-circle" size={20} color={FORM_COLORS.primary} />
                 <Text style={FORM_STYLES.toggleLabel}>Active Warehouse</Text>
               </View>
               <TouchableOpacity
                 style={[
                   FORM_STYLES.toggleSwitch,
                   formData.is_active && FORM_STYLES.toggleSwitchActive
                 ]}
                 onPress={() => updateField('is_active', !formData.is_active)}
               >
                 <View style={[
                   FORM_STYLES.toggleThumb,
                   formData.is_active && FORM_STYLES.toggleThumbActive
                 ]} />
               </TouchableOpacity>
             </View>
           </View>

           {/* Action Buttons */}
           <View style={FORM_STYLES.buttonContainer}>
             <TouchableOpacity
               style={FORM_STYLES.secondaryButton}
               onPress={onCancel}
             >
               <Text style={FORM_STYLES.secondaryButtonText}>Cancel</Text>
             </TouchableOpacity> 
             <LinearGradient
               colors={FORM_COLORS.primaryGradient}
               style={[FORM_STYLES.primaryButton, loading && FORM_STYLES.buttonDisabled]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
             >
               <TouchableOpacity
                 style={FORM_STYLES.primaryButtonContent}
                 onPress={handleSubmit}
                 disabled={loading}
               >
                 {loading ? (
                   <ActivityIndicator color="#fff" size="small" />
                 ) : (
                   <>
                     <Icon 
                       name={mode === 'create' ? 'plus' : 'content-save'} 
                       size={20} 
                       color="#fff" 
                       style={FORM_STYLES.primaryButtonIcon}
                     />
                     <Text style={FORM_STYLES.primaryButtonText}>
                       {mode === 'create' ? 'Create Warehouse' : 'Update Warehouse'}
                     </Text>
                   </>
                 )}
               </TouchableOpacity>
             </LinearGradient>
           </View>
         </View>
       </ScrollView>

       {/* Success Modal */}
       <SuccessModal
         visible={showSuccessModal}
         title="Success!"
         message={successMessage}
         onClose={handleSuccessModalClose}
         onAction={handleSuccessModalClose}
         actionText="Continue"
          iconType="message"
        />

        {/* Failure Modal */}
        <FailureModal
          visible={showFailureModal}
          title="Update Failed"
          message={failureMessage}
          onClose={handleFailureModalClose}
          onAction={handleFailureModalAction}
          actionText="Try Again"
          animationType="shake"
          iconType="error"
       />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.light,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text.primary,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.status.error,
  },
  errorText: {
    color: COLORS.status.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  buttonIcon: {
    marginRight: 8,
  },
  customSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default WarehouseForm;
