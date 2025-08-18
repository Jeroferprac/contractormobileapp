import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { StatusBar } from '../../components/StatusBar';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import { User } from '../../types/api';

interface ProfileEditScreenProps {
  navigation: any;
  route: {
    params: {
      user: User;
    };
  };
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation, route }) => {
  const { user: authUser } = useAuth();
  const user = route.params?.user || authUser;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
    company: user?.company || '',
    job_title: user?.job_title || '',
    linkedin: user?.social_media?.linkedin || '',
    instagram: user?.social_media?.instagram || '',
    facebook: user?.social_media?.facebook || '',
  });

  // Custom Input Component
  const CustomInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    multiline = false, 
    numberOfLines = 1,
    keyboardType = 'default',
    icon,
    ...props 
  }: any) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        {icon && <Icon name={icon} size={20} color={COLORS.primary} style={styles.inputIcon} />}
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          value && styles.textInputFilled
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.tertiary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        {...props}
      />
    </View>
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        full_name: formData.full_name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        company: formData.company,
        job_title: formData.job_title,
        social_media: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
        },
      };

      await profileService.updateUserProfile(updateData);
      
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerSaveButton} disabled={loading}>
          <Text style={styles.headerSaveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={COLORS.gradient.primary}
              style={styles.profileHeaderGradient}
            >
              <View style={styles.profileHeaderContent}>
                <View style={styles.profileAvatar}>
                  <Icon name="person" size={40} color={COLORS.white} />
                </View>
                <Text style={styles.profileHeaderTitle}>Edit Your Profile</Text>
                <Text style={styles.profileHeaderSubtitle}>Update your information and preferences</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="person-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            
            <CustomInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, full_name: text }))}
              placeholder="Enter your full name"
              icon="person"
            />

            <CustomInput
              label="Bio"
              value={formData.bio}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
              icon="description"
            />

            <CustomInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              icon="phone"
            />

            <CustomInput
              label="Location"
              value={formData.location}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Enter your location"
              icon="location-on"
            />

            <CustomInput
              label="Website"
              value={formData.website}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, website: text }))}
              placeholder="Enter your website URL"
              keyboardType="url"
              icon="language"
            />
          </View>

          {/* Professional Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="work-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Professional Information</Text>
            </View>

            <CustomInput
              label="Company"
              value={formData.company}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, company: text }))}
              placeholder="Enter your company name"
              icon="business"
            />

            <CustomInput
              label="Job Title"
              value={formData.job_title}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, job_title: text }))}
              placeholder="Enter your job title"
              icon="work"
            />
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="share" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Social Media</Text>
            </View>

            <CustomInput
              label="LinkedIn"
              value={formData.linkedin}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, linkedin: text }))}
              placeholder="Enter your LinkedIn profile"
              keyboardType="url"
              icon="link"
            />

            <CustomInput
              label="Instagram"
              value={formData.instagram}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, instagram: text }))}
              placeholder="Enter your Instagram handle"
              icon="camera-alt"
            />

            <CustomInput
              label="Facebook"
              value={formData.facebook}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, facebook: text }))}
              placeholder="Enter your Facebook profile"
              keyboardType="url"
              icon="facebook"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Icon name="save" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  cancelButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSaveButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  headerSaveButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  
  // Profile Header
  profileHeader: {
    marginBottom: SPACING.lg,
  },
  profileHeaderGradient: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  profileHeaderContent: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  profileHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },

  // Input Styles
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.text.primary,
    ...SHADOWS.sm,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  textInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },

  // Button Styles
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default ProfileEditScreen;
