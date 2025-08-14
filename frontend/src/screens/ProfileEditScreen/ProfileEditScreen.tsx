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
} from 'react-native';
import { StatusBar } from '../../components/StatusBar';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
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
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Full Name"
            value={formData.full_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
            placeholder="Enter your full name"
          />

          <Input
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Input
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="Enter your location"
          />

          <Input
            label="Website"
            value={formData.website}
            onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
            placeholder="Enter your website URL"
            keyboardType="url"
          />

          <Text style={styles.sectionTitle}>Professional Information</Text>

          <Input
            label="Company"
            value={formData.company}
            onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
            placeholder="Enter your company name"
          />

          <Input
            label="Job Title"
            value={formData.job_title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, job_title: text }))}
            placeholder="Enter your job title"
          />

          <Text style={styles.sectionTitle}>Social Media</Text>

          <Input
            label="LinkedIn"
            value={formData.linkedin}
            onChangeText={(text) => setFormData(prev => ({ ...prev, linkedin: text }))}
            placeholder="Enter your LinkedIn profile"
            keyboardType="url"
          />

          <Input
            label="Instagram"
            value={formData.instagram}
            onChangeText={(text) => setFormData(prev => ({ ...prev, instagram: text }))}
            placeholder="Enter your Instagram handle"
          />

          <Input
            label="Facebook"
            value={formData.facebook}
            onChangeText={(text) => setFormData(prev => ({ ...prev, facebook: text }))}
            placeholder="Enter your Facebook profile"
            keyboardType="url"
          />

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={loading}
              loading={loading}
            />
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
  },
  cancelButton: {
    padding: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  saveButton: {
    padding: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
});

export default ProfileEditScreen;
