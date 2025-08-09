import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image as RNImage,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface AffiliateProgramScreenProps {
  onReadInstructions: () => void;
  onBack: () => void;
}

export const AffiliateProgramScreen: React.FC<AffiliateProgramScreenProps> = ({
  onReadInstructions,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Affiliate Program</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Join Section */}
        <View style={styles.joinSection}>
          <Text style={styles.sectionTitle}>Join Our Affiliate Program</Text>
          <Text style={styles.sectionDescription}>
            Partner with us and earn commissions by promoting our construction services. 
            Share your unique referral link and start earning today!
          </Text>
        </View>

        {/* Commission Highlight */}
        <View style={styles.commissionSection}>
          <View style={styles.commissionCard}>
            <View style={styles.commissionIcon}>
              <Icon name="card-giftcard" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.commissionTitle}>Earn up to 25% Commission</Text>
            <Text style={styles.commissionDescription}>
              Get rewarded for every successful referral you bring to our platform
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Join?</Text>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={20} color={COLORS.status.success} />
            <Text style={styles.benefitText}>High commission rates up to 25%</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={20} color={COLORS.status.success} />
            <Text style={styles.benefitText}>Easy-to-use dashboard</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={20} color={COLORS.status.success} />
            <Text style={styles.benefitText}>Real-time tracking</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={20} color={COLORS.status.success} />
            <Text style={styles.benefitText}>Monthly payouts</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="check-circle" size={20} color={COLORS.status.success} />
            <Text style={styles.benefitText}>Marketing materials provided</Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Sign Up</Text>
              <Text style={styles.stepDescription}>Complete your affiliate registration</Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Your Link</Text>
              <Text style={styles.stepDescription}>Receive your unique referral link</Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share & Promote</Text>
              <Text style={styles.stepDescription}>Share your link and promote our services</Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Commissions</Text>
              <Text style={styles.stepDescription}>Get paid for every successful referral</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.readInstructionsButton} onPress={onReadInstructions}>
          <Text style={styles.readInstructionsText}>Read Instructions</Text>
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
  joinSection: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  commissionSection: {
    marginBottom: SPACING.xl,
  },
  commissionCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  commissionIcon: {
    marginBottom: SPACING.md,
  },
  commissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  commissionDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  howItWorksSection: {
    marginBottom: SPACING.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    color: COLORS.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  readInstructionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  readInstructionsText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
});