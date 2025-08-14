import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface AboutTabProps {
  user: {
    description: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    socialMedia: {
      linkedin?: string;
      instagram?: string;
      facebook?: string;
    };
    joinedDate: string;
  };
  onContactPress: (type: string, value: string) => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ user, onContactPress }) => {
  const renderContactItem = (icon: string, label: string, value: string, type: string) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => onContactPress(type, value)}
    >
      <Icon name={icon} size={20} color={COLORS.text.secondary} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );

  const renderSocialMediaItem = (icon: string, platform: string, url?: string) => (
    <TouchableOpacity
      style={[styles.socialItem, !url && styles.disabledItem]}
      onPress={() => url && onContactPress(platform, url)}
    >
      <Icon name={icon} size={24} color={url ? COLORS.primary : COLORS.text.secondary} />
      <Text style={[styles.socialText, !url && styles.disabledText]}>{platform}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {/* Professional Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{user.description}</Text>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.subsectionTitle}>Contact Details</Text>
            {renderContactItem('email', 'Email', user.email, 'email')}
            {user.phone && user.phone !== 'No phone available' && 
              renderContactItem('phone', 'Phone', user.phone, 'phone')}
            {user.address && user.address !== 'No address available' && 
              renderContactItem('location-on', 'Address', user.address, 'address')}
            {user.website && user.website !== 'No website available' && 
              renderContactItem('language', 'Website', user.website, 'website')}
          </View>

          {/* Social Media */}
          <View style={styles.socialSection}>
            <Text style={styles.subsectionTitle}>Social Media</Text>
            <View style={styles.socialGrid}>
              {renderSocialMediaItem('linkedin', 'LinkedIn', user.socialMedia.linkedin)}
              {renderSocialMediaItem('camera-alt', 'Instagram', user.socialMedia.instagram)}
              {renderSocialMediaItem('facebook', 'Facebook', user.socialMedia.facebook)}
            </View>
            {!user.socialMedia.linkedin && !user.socialMedia.instagram && !user.socialMedia.facebook && (
              <Text style={styles.noSocialText}>No social media links added</Text>
            )}
          </View>

          {/* Joined Date */}
          <View style={styles.joinedSection}>
            <Text style={styles.joinedText}>Joined {user.joinedDate}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  descriptionContainer: {
    marginBottom: SPACING.lg,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: SPACING.lg,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  socialSection: {
    marginBottom: SPACING.lg,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialItem: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  socialText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  disabledText: {
    color: COLORS.text.secondary,
  },
  disabledItem: {
    opacity: 0.5,
  },
  joinedSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  joinedText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  noSocialText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
});