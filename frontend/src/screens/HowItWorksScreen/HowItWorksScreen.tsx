import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface HowItWorksScreenProps {
  onSignIn: () => void;
  onBack: () => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({
  onSignIn,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How it work</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Visual */}
        <View style={styles.visualContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' }}
            style={styles.visualImage}
            resizeMode="cover"
          />
        </View>

        {/* Detailed Sections */}
        <View style={styles.sectionsContainer}>
          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>1</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>How the Affiliate Program Works</Text>
              <Text style={styles.sectionDescription}>
                Our affiliate program allows you to earn commissions by promoting our construction services. 
                When someone uses your unique referral link to sign up and makes a purchase, you earn a commission.
              </Text>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>2</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Key Benefits for You</Text>
              <Text style={styles.sectionDescription}>
                • High commission rates up to 25%{'\n'}
                • Real-time tracking and analytics{'\n'}
                • Monthly payouts{'\n'}
                • Marketing materials provided{'\n'}
                • Dedicated support team
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>3</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Key Benefits for Affiliates</Text>
              <Text style={styles.sectionDescription}>
                • Flexible working hours{'\n'}
                • No upfront investment required{'\n'}
                • Passive income potential{'\n'}
                • Professional development opportunities{'\n'}
                • Community support
              </Text>
            </View>
          </View>

          {/* Section 4 - Commission Structure */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>4</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Commission Structure</Text>
              
              <View style={styles.commissionTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Subscription Tier</Text>
                  <Text style={styles.tableHeaderText}>Monthly Commission</Text>
                  <Text style={styles.tableHeaderText}>Quarterly Bonus</Text>
                </View>
                
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Basic</Text>
                  <Text style={styles.tableCell}>15%</Text>
                  <Text style={styles.tableCell}>$50</Text>
                </View>
                
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Professional</Text>
                  <Text style={styles.tableCell}>20%</Text>
                  <Text style={styles.tableCell}>$100</Text>
                </View>
                
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Enterprise</Text>
                  <Text style={styles.tableCell}>25%</Text>
                  <Text style={styles.tableCell}>$200</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>5</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>How to Track and Monitor the Program</Text>
              <Text style={styles.sectionDescription}>
                Access your personalized dashboard to track clicks, conversions, and earnings in real-time. 
                Monitor your performance with detailed analytics and reports.
              </Text>
            </View>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionNumber}>6</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Additional Incentives to Keep Affiliates Engaged</Text>
              
              <View style={styles.incentiveItem}>
                <Icon name="emoji-events" size={20} color={COLORS.primary} />
                <View style={styles.incentiveContent}>
                  <Text style={styles.incentiveTitle}>Performance Bonus</Text>
                  <Text style={styles.incentiveDescription}>
                    Earn additional bonuses for exceeding monthly targets
                  </Text>
                </View>
              </View>
              
              <View style={styles.incentiveItem}>
                <Icon name="leaderboard" size={20} color={COLORS.primary} />
                <View style={styles.incentiveContent}>
                  <Text style={styles.incentiveTitle}>Leaderboard Challenges</Text>
                  <Text style={styles.incentiveDescription}>
                    Compete with other affiliates and win exclusive rewards
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
          <Text style={styles.signInText}>Sign in to Join Affiliate Program</Text>
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
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  visualContainer: {
    height: 200,
    marginBottom: SPACING.lg,
  },
  visualImage: {
    width: '100%',
    height: '100%',
  },
  sectionsContainer: {
    paddingHorizontal: SPACING.md,
  },
  section: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  sectionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: SPACING.md,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  commissionTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
  },
  tableHeaderText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  tableCell: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
    textAlign: 'center',
  },
  incentiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  incentiveContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  incentiveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  incentiveDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  actionContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  signInText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
}); 