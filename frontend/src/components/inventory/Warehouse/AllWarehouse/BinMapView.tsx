import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  row: number;
  column: number;
}

interface BinMapViewProps {
  bins: Bin[];
  onBinPress: (bin: Bin) => void;
}

const BinMapView: React.FC<BinMapViewProps> = ({ bins, onBinPress }) => {
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

  const getStatusTextColor = (status: Bin['status']) => {
    switch (status) {
      case 'empty': return '#6B7280';
      case 'low': return '#92400E';
      case 'medium': return '#1E40AF';
      case 'full': return '#991B1B';
      default: return '#6B7280';
    }
  };

  // Create a grid layout (8x10 for example)
  const gridRows = 8;
  const gridColumns = 10;
  const grid: (Bin | null)[][] = Array(gridRows).fill(null).map(() => Array(gridColumns).fill(null));

  // Place bins in the grid
  bins.forEach(bin => {
    if (bin.row < gridRows && bin.column < gridColumns) {
      grid[bin.row][bin.column] = bin;
    }
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Warehouse Layout</Text>
        
        <View style={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((bin, colIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.gridCell,
                    bin ? {
                      backgroundColor: getStatusColor(bin.status),
                      borderColor: getStatusBorderColor(bin.status),
                    } : styles.emptyCell
                  ]}
                  onPress={() => bin && onBinPress(bin)}
                  disabled={!bin}
                >
                  {bin && (
                    <>
                      <Text style={[styles.binCode, { color: getStatusTextColor(bin.status) }]}>
                        {bin.code}
                      </Text>
                      <Text style={[styles.binUsage, { color: getStatusTextColor(bin.status) }]}>
                        {Math.round((bin.currentStock / bin.capacity) * 100)}%
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E5E7EB', borderColor: '#D1D5DB' }]} />
              <Text style={styles.legendText}>Empty</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Full</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    padding: SPACING.md,
  },
  mapTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  gridContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  gridCell: {
    flex: 1,
    height: 40,
    margin: 1,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  binCode: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: 1,
  },
  binUsage: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  legend: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  legendTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    marginBottom: 4,
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
});

export default BinMapView;
