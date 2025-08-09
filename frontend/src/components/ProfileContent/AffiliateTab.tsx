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

interface AffiliateCompany {
  id: string;
  name: string;
  logo: string;
  joinedDate: string;
  revenue: string;
  status: 'active' | 'pending' | 'inactive';
}

interface AffiliateTabProps {
  companies: AffiliateCompany[];
  onJoinNow: () => void;
  onCompanyPress: (company: AffiliateCompany) => void;
}

export const AffiliateTab: React.FC<AffiliateTabProps> = ({
  companies,
  onJoinNow,
  onCompanyPress,
}) => {
  const getStatusColor = (status: AffiliateCompany['status']) => {
    switch (status) {
      case 'active':
        return COLORS.status.success;
      case 'pending':
        return COLORS.status.warning;
      case 'inactive':
        return COLORS.status.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status: AffiliateCompany['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const renderCompany = (company: AffiliateCompany) => (
    <TouchableOpacity
      key={company.id}
      style={styles.companyItem}
      onPress={() => onCompanyPress(company)}
    >
      <View style={styles.companyLogo}>
        <Text style={styles.logoText}>{company.name.charAt(0)}</Text>
      </View>
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{company.name}</Text>
        <Text style={styles.companyDate}>Joined on {company.joinedDate}</Text>
      </View>
      <View style={styles.companyStats}>
        <Text style={styles.revenueText}>Revenue</Text>
        <Text style={styles.revenueAmount}>{company.revenue}</Text>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(company.status) }]}>
        <Text style={styles.statusText}>{getStatusText(company.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affiliate Companies</Text>
          {companies.map(renderCompany)}
          
          {/* Join Now Button */}
          <TouchableOpacity style={styles.joinButton} onPress={onJoinNow}>
            <Text style={styles.joinButtonText}>Join Now</Text>
          </TouchableOpacity>
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
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  companyDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  companyStats: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  revenueText: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.text.light,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light,
  },
});