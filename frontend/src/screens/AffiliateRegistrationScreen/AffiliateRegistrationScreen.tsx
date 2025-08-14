import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface AffiliateRegistrationScreenProps {
  onCompleteRegistration: () => void;
  onBack: () => void;
}

export const AffiliateRegistrationScreen: React.FC<AffiliateRegistrationScreenProps> = ({
  onCompleteRegistration,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    idType: '',
    idNumber: '',
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftBic: '',
    taxId: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteRegistration = () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'country'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    onCompleteRegistration();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Affiliate Registration</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter email address"
              placeholderTextColor={COLORS.text.secondary}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone No *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter phone number"
              placeholderTextColor={COLORS.text.secondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter address"
              placeholderTextColor={COLORS.text.secondary}

            />
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="Enter city"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Country *</Text>
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(value) => handleInputChange('country', value)}
                placeholder="Enter country"
                placeholderTextColor={COLORS.text.secondary}
              />
            </View>
          </View>
        </View>

        {/* ID Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID Verification</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ID Type</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>
                {formData.idType || 'Select ID type'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={COLORS.text.secondary} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ID Number</Text>
            <TextInput
              style={styles.input}
              value={formData.idNumber}
              onChangeText={(value) => handleInputChange('idNumber', value)}
              placeholder="Enter ID number"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>

          <TouchableOpacity style={styles.uploadButton}>
            <Icon name="cloud-upload" size={24} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={formData.bankName}
              onChangeText={(value) => handleInputChange('bankName', value)}
              placeholder="Enter bank name"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={formData.accountNumber}
              onChangeText={(value) => handleInputChange('accountNumber', value)}
              placeholder="Enter account number"
              placeholderTextColor={COLORS.text.secondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>IBAN</Text>
            <TextInput
              style={styles.input}
              value={formData.iban}
              onChangeText={(value) => handleInputChange('iban', value)}
              placeholder="Enter IBAN"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>SWIFT/BIC Code</Text>
            <TextInput
              style={styles.input}
              value={formData.swiftBic}
              onChangeText={(value) => handleInputChange('swiftBic', value)}
              placeholder="Enter SWIFT/BIC code"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tax ID/VAT Number</Text>
            <TextInput
              style={styles.input}
              value={formData.taxId}
              onChangeText={(value) => handleInputChange('taxId', value)}
              placeholder="Enter tax ID/VAT number"
              placeholderTextColor={COLORS.text.secondary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteRegistration}>
          <Text style={styles.completeButtonText}>Complete Registration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputContainer: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  completeButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
});