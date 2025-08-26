import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface Bin {
  id: string;
  code: string;
  location: string;
  capacity: number;
  currentStock: number;
  status: 'empty' | 'low' | 'medium' | 'full';
}

interface BinListViewProps {
  bins: Bin[];
  onBinPress: (bin: Bin) => void;
}

const BinListView: React.FC<BinListViewProps> = ({ bins, onBinPress }) => {
  const getStatusColor = (status: Bin['status']) => {
    switch (status) {
      case 'empty': return COLORS.text.tertiary;
      case 'low': return COLORS.status.warning;
      case 'medium': return COLORS.status.info;
      case 'full': return COLORS.status.error;
      default: return COLORS.text.secondary;
    }
  };

  const getStatusIcon = (status: Bin['status']) => {
    switch (status) {
      case 'empty': return 'circle';
      case 'low': return 'alert-circle';
      case 'medium': return 'info';
      case 'full': return 'check-circle';
      default: return 'circle';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {bins.map((bin) => (
        <TouchableOpacity
          key={bin.id}
          style={styles.binItem}
          onPress={() => onBinPress(bin)}
          activeOpacity={0.7}
        >
          <View style={styles.binHeader}>
            <View style={styles.binInfo}>
              <Text style={styles.binCode}>{bin.code}</Text>
              <Text style={styles.binLocation}>{bin.location}</Text>
            </View>
            
            <View style={styles.statusContainer}>
              <Icon 
                name={getStatusIcon(bin.status)} 
                size={16} 
                color={getStatusColor(bin.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(bin.status) }]}>
                {bin.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.binStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Capacity</Text>
              <Text style={styles.statValue}>{bin.capacity}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{bin.currentStock}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Usage</Text>
              <Text style={styles.statValue}>
                {Math.round((bin.currentStock / bin.capacity) * 100)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(bin.currentStock / bin.capacity) * 100}%`,
                  backgroundColor: getStatusColor(bin.status)
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  binItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  binHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  binInfo: {
    flex: 1,
  },
  binCode: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  binLocation: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  binStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
  },
});

export default BinListView;
