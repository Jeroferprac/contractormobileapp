import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface BinManagementTabProps {
  activeTab: 'list' | 'map';
  onTabChange: (tab: 'list' | 'map') => void;
  totalBins: number;
  activeBins: number;
}

const BinManagementTab: React.FC<BinManagementTabProps> = ({
  activeTab,
  onTabChange,
  totalBins,
  activeBins,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="map" size={20} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Bin Management</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => onTabChange('list')}
        >
          <Icon 
            name="list" 
            size={16} 
            color={activeTab === 'list' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
            List View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => onTabChange('map')}
        >
          <Icon 
            name="map-pin" 
            size={16} 
            color={activeTab === 'map' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>
            Map View
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.binStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalBins}</Text>
          <Text style={styles.statLabel}>Total Bins</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeBins}</Text>
          <Text style={styles.statLabel}>Active Bins</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round((activeBins / totalBins) * 100)}%</Text>
          <Text style={styles.statLabel}>Utilization</Text>
        </View>
      </View>
      
      <View style={styles.binContent}>
        {activeTab === 'list' ? (
          <View style={styles.binList}>
            <Text style={styles.binText}>Bin List View</Text>
            <Text style={styles.binSubtext}>View all bins in a list format</Text>
          </View>
        ) : (
          <View style={styles.binMap}>
            <Text style={styles.binText}>Bin Map View</Text>
            <Text style={styles.binSubtext}>Interactive warehouse layout</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  binStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border.light,
  },
  binContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  binList: {
    alignItems: 'center',
  },
  binMap: {
    alignItems: 'center',
  },
  binText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  binSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default BinManagementTab;
