import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface BinManagementScreenProps {
  navigation?: any;
}

const BinManagementScreen: React.FC<BinManagementScreenProps> = ({ navigation }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('Main Distribution Center');
  const [totalBins, setTotalBins] = useState(120);
  const [activeBins, setActiveBins] = useState(98);
  const [utilization, setUtilization] = useState(82);

  // Dummy bin data
  const dummyBins = [
    { id: "1", code: "A1", location: "Row A, Column 1", capacity: 100, currentStock: 85, status: 'medium' as const, row: 0, column: 0 },
    { id: "2", code: "A2", location: "Row A, Column 2", capacity: 100, currentStock: 25, status: 'low' as const, row: 0, column: 1 },
    { id: "3", code: "A3", location: "Row A, Column 3", capacity: 100, currentStock: 0, status: 'empty' as const, row: 0, column: 2 },
    { id: "4", code: "B1", location: "Row B, Column 1", capacity: 100, currentStock: 95, status: 'full' as const, row: 1, column: 0 },
    { id: "5", code: "B2", location: "Row B, Column 2", capacity: 100, currentStock: 60, status: 'medium' as const, row: 1, column: 1 },
  ];

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleMapViewPress = () => {
    // Navigate to map view
    console.log('Navigate to map view');
  };

  const handleBinDetailsPress = () => {
    // Navigate to bin details
    console.log('Navigate to bin details');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Bin Management</Text>
          
          <TouchableOpacity style={styles.addButton}>
            <Icon name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warehouse Info */}
        <View style={styles.warehouseInfo}>
          <Text style={styles.warehouseName}>{selectedWarehouse}</Text>
          <Text style={styles.warehouseStats}>
            {totalBins} Total Bins • {activeBins} Active • {utilization}% Utilization
          </Text>
        </View>

        {/* Card 1: Map View */}
        <TouchableOpacity style={styles.card} onPress={handleMapViewPress}>
          <View style={styles.cardHeader}>
            <Icon name="map" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Map View</Text>
            <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
          </View>
          
          <Text style={styles.cardDescription}>
            Interactive warehouse layout with real-time bin locations and status
          </Text>
          
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalBins}</Text>
              <Text style={styles.statLabel}>Total Bins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeBins}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{utilization}%</Text>
              <Text style={styles.statLabel}>Utilization</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 2: Bin Details */}
        <TouchableOpacity style={styles.card} onPress={handleBinDetailsPress}>
          <View style={styles.cardHeader}>
            <Icon name="list" size={24} color={COLORS.accent} />
            <Text style={styles.cardTitle}>Bin Details</Text>
            <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
          </View>
          
          <Text style={styles.cardDescription}>
            Comprehensive list of all bins with detailed information and status
          </Text>
          
          <View style={styles.binList}>
            {dummyBins.slice(0, 3).map((bin) => (
              <View key={bin.id} style={styles.binItem}>
                <View style={styles.binInfo}>
                  <Text style={styles.binCode}>{bin.code}</Text>
                  <Text style={styles.binLocation}>{bin.location}</Text>
                </View>
                <View style={styles.binStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(bin.status) }]} />
                  <Text style={styles.binStock}>{bin.currentStock}/{bin.capacity}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.moreText}>+{dummyBins.length - 3} more bins</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="plus" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Add Bin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="edit" size={20} color={COLORS.accent} />
            <Text style={styles.actionText}>Edit Layout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="download" size={20} color={COLORS.status.info} />
            <Text style={styles.actionText}>Export</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'empty': return COLORS.text.tertiary;
    case 'low': return COLORS.status.warning;
    case 'medium': return COLORS.status.info;
    case 'full': return COLORS.status.error;
    default: return COLORS.text.secondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  warehouseInfo: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  warehouseName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  warehouseStats: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  statItem: {
    alignItems: 'center',
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
  binList: {
    gap: SPACING.sm,
  },
  binItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  binInfo: {
    flex: 1,
  },
  binCode: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  binLocation: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  binStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  binStock: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  moreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
});

export default BinManagementScreen;
