import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Bin {
  id: string;
  code: string;
  location: string;
  capacity: number;
  currentStock: number;
  status: 'empty' | 'low' | 'medium' | 'full';
  row: number;
  column: number;
  warehouseId: string;
  latitude?: number;
  longitude?: number;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    image?: string;
  }>;
}

interface GoogleMapViewProps {
  bins: Bin[];
  onBinPress: (bin: Bin) => void;
  warehouseLocation?: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({ 
  bins, 
  onBinPress, 
  warehouseLocation 
}) => {
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [showBinDetail, setShowBinDetail] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showClusters, setShowClusters] = useState(true);

  // Default warehouse location (you can replace with actual coordinates)
  const defaultLocation = warehouseLocation || {
    latitude: 25.2048, // Dubai coordinates
    longitude: 55.2708,
    name: 'Main Warehouse',
    address: 'Dubai, UAE'
  };

  const getStatusColor = (status: Bin['status']) => {
    switch (status) {
      case 'empty': return '#E5E7EB';
      case 'low': return '#FEF3C7';
      case 'medium': return '#DBEAFE';
      case 'full': return '#FEE2E2';
      default: return '#E5E7EB';
    }
  };

  const getStatusBorderColor = (status: Bin['status']) => {
    switch (status) {
      case 'empty': return '#D1D5DB';
      case 'low': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'full': return '#EF4444';
      default: return '#D1D5DB';
    }
  };

  const handleBinPress = (bin: Bin) => {
    setSelectedBin(bin);
    setShowBinDetail(true);
    onBinPress(bin);
  };

  const handleCloseBinDetail = () => {
    setShowBinDetail(false);
    setSelectedBin(null);
  };

  // Generate bin coordinates around warehouse location
  const generateBinCoordinates = (bins: Bin[]) => {
    return bins.map((bin, index) => {
      // Generate coordinates in a grid pattern around the warehouse
      const row = Math.floor(index / 12);
      const col = index % 12;
      const latOffset = (row - 4) * 0.0001; // Small offset for grid
      const lngOffset = (col - 6) * 0.0001;
      
      return {
        ...bin,
        latitude: defaultLocation.latitude + latOffset,
        longitude: defaultLocation.longitude + lngOffset,
      };
    });
  };

  const binsWithCoordinates = generateBinCoordinates(bins);

  // Calculate statistics
  const totalBins = bins.length;
  const occupiedBins = bins.filter(bin => bin.currentStock > 0).length;
  const utilization = Math.round((occupiedBins / totalBins) * 100);

  return (
    <View style={styles.container}>
      {/* Map Header */}
      <View style={styles.mapHeader}>
        <View style={styles.headerLeft}>
          <Icon name="map-pin" size={20} color={COLORS.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.warehouseName}>{defaultLocation.name}</Text>
            <Text style={styles.warehouseAddress}>{defaultLocation.address}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.activeMapType]}
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <Icon name={mapType === 'satellite' ? 'globe' : 'map'} size={16} color={mapType === 'satellite' ? COLORS.text.light : COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Google Maps would go here - for now showing a placeholder */}
        <View style={styles.mapPlaceholder}>
          <Icon name="map" size={48} color={COLORS.text.tertiary} />
          <Text style={styles.mapPlaceholderText}>Google Maps Integration</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {mapType === 'satellite' ? 'Satellite View' : 'Standard View'}
          </Text>
          
          {/* Bin Markers Overlay */}
          <View style={styles.binMarkersOverlay}>
            {binsWithCoordinates.slice(0, 20).map((bin) => (
              <TouchableOpacity
                key={bin.id}
                style={[
                  styles.binMarker,
                  {
                    backgroundColor: getStatusColor(bin.status),
                    borderColor: getStatusBorderColor(bin.status),
                    left: `${(bin.column / 12) * 100}%`,
                    top: `${(bin.row / 8) * 100}%`,
                  }
                ]}
                onPress={() => handleBinPress(bin)}
              >
                <Text style={[styles.binMarkerText, { color: getStatusBorderColor(bin.status) }]}>
                  {bin.code}
                </Text>
                {bin.currentStock > 0 && (
                  <View style={styles.binMarkerIndicator}>
                    <Text style={styles.binMarkerIndicatorText}>
                      {Math.round((bin.currentStock / bin.capacity) * 100)}%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <View style={styles.controlGroup}>
          <TouchableOpacity
            style={[styles.controlButton, showClusters && styles.activeControl]}
            onPress={() => setShowClusters(!showClusters)}
          >
            <Icon name="layers" size={16} color={showClusters ? COLORS.text.light : COLORS.text.secondary} />
            <Text style={[styles.controlText, showClusters && styles.activeControlText]}>
              Clusters
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Icon name="search" size={16} color={COLORS.text.secondary} />
            <Text style={styles.controlText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Icon name="filter" size={16} color={COLORS.text.secondary} />
            <Text style={styles.controlText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Statistics */}
      <View style={styles.mapStats}>
        <View style={styles.statItem}>
          <Icon name="grid" size={16} color={COLORS.primary} />
          <Text style={styles.statValue}>{totalBins}</Text>
          <Text style={styles.statLabel}>Total Bins</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="check-circle" size={16} color={COLORS.status.success} />
          <Text style={styles.statValue}>{occupiedBins}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trending-up" size={16} color={COLORS.status.info} />
          <Text style={styles.statValue}>{utilization}%</Text>
          <Text style={styles.statLabel}>Utilization</Text>
        </View>
      </View>

      {/* Bin Detail Modal */}
      <Modal
        visible={showBinDetail}
        transparent
        animationType="slide"
        onRequestClose={handleCloseBinDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBin && (
              <View style={styles.binDetailContent}>
                <View style={styles.binDetailHeader}>
                  <View style={styles.binDetailTitle}>
                    <Icon name="map-pin" size={20} color={COLORS.primary} />
                    <Text style={styles.binDetailCode}>{selectedBin.code}</Text>
                  </View>
                  <TouchableOpacity onPress={handleCloseBinDetail}>
                    <Icon name="x" size={24} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.binDetailLocation}>{selectedBin.location}</Text>
                
                <View style={styles.binDetailStats}>
                  <View style={styles.binDetailStat}>
                    <Text style={styles.binDetailStatValue}>{selectedBin.currentStock}</Text>
                    <Text style={styles.binDetailStatLabel}>Current Stock</Text>
                  </View>
                  <View style={styles.binDetailStatDivider} />
                  <View style={styles.binDetailStat}>
                    <Text style={styles.binDetailStatValue}>{selectedBin.capacity}</Text>
                    <Text style={styles.binDetailStatLabel}>Capacity</Text>
                  </View>
                  <View style={styles.binDetailStatDivider} />
                  <View style={styles.binDetailStat}>
                    <Text style={styles.binDetailStatValue}>
                      {Math.round((selectedBin.currentStock / selectedBin.capacity) * 100)}%
                    </Text>
                    <Text style={styles.binDetailStatLabel}>Utilization</Text>
                  </View>
                </View>
                
                <View style={styles.binDetailActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="edit" size={16} color={COLORS.primary} />
                    <Text style={styles.actionButtonText}>Edit Bin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="navigation" size={16} color={COLORS.status.info} />
                    <Text style={styles.actionButtonText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationInfo: {
    marginLeft: SPACING.sm,
  },
  warehouseName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  warehouseAddress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapTypeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  activeMapType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  mapPlaceholderSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  binMarkersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  binMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  binMarkerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  binMarkerIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  binMarkerIndicatorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.light,
    fontWeight: '600',
  },
  mapControls: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  controlGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
  },
  activeControl: {
    backgroundColor: COLORS.primary,
  },
  controlText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  activeControlText: {
    color: COLORS.text.light,
  },
  mapStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
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
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.lg,
    width: screenWidth - SPACING.lg * 2,
    maxHeight: screenHeight * 0.7,
    ...SHADOWS.lg,
  },
  binDetailContent: {
    flex: 1,
  },
  binDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  binDetailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  binDetailCode: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  binDetailLocation: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  binDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  binDetailStat: {
    alignItems: 'center',
  },
  binDetailStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  binDetailStatLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  binDetailStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border.light,
  },
  binDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
});

export default GoogleMapView;
