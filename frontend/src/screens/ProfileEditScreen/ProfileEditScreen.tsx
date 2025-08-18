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
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import { User } from '../../types/api';
import { Input } from '../../components/Input';
import { Card, Badge } from '../../components/ui';

const { width } = Dimensions.get('window');

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
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
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

  // Track changes
  useEffect(() => {
    const originalData = {
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
    };
    
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalData));
  }, [formData, user]);

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL starting with http:// or https://';
    }

    if (formData.linkedin && !/^https?:\/\/.+/.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    if (formData.facebook && !/^https?:\/\/.+/.test(formData.facebook)) {
      newErrors.facebook = 'Please enter a valid Facebook URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form before saving.');
      return;
    }

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
      
      Alert.alert(
        'Success', 
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
    navigation.goBack();
    }
  };

  const completedFields = Object.values(formData).filter(v => v.trim()).length;
  const totalFields = Object.keys(formData).length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
        {/* Header with Gradient */}
            <LinearGradient
              colors={COLORS.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Icon name="arrow-left" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerBadgeContainer}>
              <Badge 
                label={hasChanges ? 'Unsaved changes' : `${completionPercentage}% complete`}
                variant={hasChanges ? 'warning' : 'info'}
                size="sm"
              />
                </View>
              </View>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[
              styles.headerSaveButton, 
              (!hasChanges || loading) && styles.headerSaveButtonDisabled
            ]} 
            disabled={!hasChanges || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.headerSaveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
            </LinearGradient>

        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
          <View style={styles.patternCircle3} />
          </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Personal Information Section */}
            <Card variant="elevated" padding="lg" margin="lg" style={styles.formCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Icon name="user" size={20} color={COLORS.text.light} />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
              <Input
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, full_name: text }))}
              placeholder="Enter your full name"
                error={errors.full_name}
                icon={<Icon name="user" size={20} color={COLORS.text.secondary} />}
                autoCapitalize="words"
                maxLength={50}
            />

              <Input
              value={formData.bio}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Describe your expertise and experience"
                error={errors.bio}
                icon={<Icon name="file-text" size={20} color={COLORS.text.secondary} />}
              multiline
                numberOfLines={4}
                maxLength={200}
            />

              <Input
              value={formData.phone}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
                error={errors.phone}
                icon={<Icon name="phone" size={20} color={COLORS.text.secondary} />}
              keyboardType="phone-pad"
            />

              <Input
              value={formData.location}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="City, State or Country"
                error={errors.location}
                icon={<Icon name="map-pin" size={20} color={COLORS.text.secondary} />}
                autoCapitalize="words"
              />

              <Input
              value={formData.website}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, website: text }))}
                placeholder="https://yourwebsite.com"
                error={errors.website}
                icon={<Icon name="globe" size={20} color={COLORS.text.secondary} />}
              keyboardType="url"
                autoCapitalize="none"
            />
            </Card>

          {/* Professional Information Section */}
            <Card variant="elevated" padding="lg" margin="lg" style={styles.formCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Icon name="briefcase" size={20} color={COLORS.text.light} />
                </View>
              <Text style={styles.sectionTitle}>Professional Information</Text>
            </View>

              <Input
              value={formData.company}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, company: text }))}
                placeholder="Your company or organization"
                error={errors.company}
                icon={<Icon name="building" size={20} color={COLORS.text.secondary} />}
                autoCapitalize="words"
                maxLength={50}
              />

              <Input
              value={formData.job_title}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, job_title: text }))}
                placeholder="Your current position"
                error={errors.job_title}
                icon={<Icon name="award" size={20} color={COLORS.text.secondary} />}
                autoCapitalize="words"
                maxLength={50}
              />
            </Card>

          {/* Social Media Section */}
            <Card variant="elevated" padding="lg" margin="lg" style={styles.formCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Icon name="share-2" size={20} color={COLORS.text.light} />
                </View>
              <Text style={styles.sectionTitle}>Social Media</Text>
            </View>

              <Input
              value={formData.linkedin}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, linkedin: text }))}
                placeholder="https://linkedin.com/in/yourprofile"
                error={errors.linkedin}
                icon={<Icon name="linkedin" size={20} color={COLORS.text.secondary} />}
              keyboardType="url"
                autoCapitalize="none"
            />

              <Input
              value={formData.instagram}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, instagram: text }))}
                placeholder="@yourusername"
                error={errors.instagram}
                icon={<Icon name="instagram" size={20} color={COLORS.text.secondary} />}
                autoCapitalize="none"
              />

              <Input
              value={formData.facebook}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, facebook: text }))}
                placeholder="https://facebook.com/yourprofile"
                error={errors.facebook}
                icon={<Icon name="facebook" size={20} color={COLORS.text.secondary} />}
              keyboardType="url"
                autoCapitalize="none"
              />
            </Card>
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
    paddingVertical: SPACING.sm,
    paddingTop: SPACING.lg,
    ...SHADOWS.lg,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.light,
    marginBottom: SPACING.xs,
  },
  headerBadgeContainer: {
    marginTop: SPACING.xs,
  },
  headerSaveButton: {
    backgroundColor: COLORS.text.light,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 60,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerSaveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerSaveButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: -1,
  },
  patternCircle1: {
    position: 'absolute',
    top: 50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
  },
  patternCircle2: {
    position: 'absolute',
    top: 150,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary + '30',
  },
  patternCircle3: {
    position: 'absolute',
    top: 200,
    right: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '25',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  
  // Form Container
  formContainer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  formCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});

export default ProfileEditScreen;
