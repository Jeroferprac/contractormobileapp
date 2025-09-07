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
  description?: string;
  projects?: number;
  rating?: number;
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
        <Text style={styles.logoText}>{company.logo}</Text>
      </View>
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{company.name}</Text>
        {company.description && (
          <Text style={styles.companyDescription} numberOfLines={1}>
            {company.description}
          </Text>
        )}
        <Text style={styles.companyDate}>Joined on {company.joinedDate}</Text>
        {company.projects !== undefined && (
          <Text style={styles.companyProjects}>
            {company.projects} projects completed
          </Text>
        )}
      </View>
      <View style={styles.companyStats}>
        <Text style={styles.revenueText}>Revenue</Text>
        <Text style={styles.revenueAmount}>{company.revenue}</Text>
        {company.rating && company.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={12} color="#FB7504" />
            <Text style={styles.ratingText}>{company.rating}</Text>
          </View>
        )}
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
          {companies.length > 0 ? (
            <>
              {companies.map(renderCompany)}
              
              {/* Join Now Button */}
              <TouchableOpacity style={styles.joinButton} onPress={onJoinNow}>
                <Text style={styles.joinButtonText}>Join Now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="business" size={48} color={COLORS.text.secondary} />
              <Text style={styles.emptyStateText}>No affiliate companies</Text>
              <Text style={styles.emptyStateSubtext}>Join the affiliate program to start earning</Text>
              <TouchableOpacity style={styles.joinButton} onPress={onJoinNow}>
                <Text style={styles.joinButtonText}>Join Now</Text>
              </TouchableOpacity>
            </View>
          )}
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
  companyDescription: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  companyDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  companyProjects: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
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
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontWeight: '500',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});