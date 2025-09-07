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


export default WarehouseForm;
