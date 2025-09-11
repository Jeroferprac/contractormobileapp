import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AreaLineChart, { Point } from './AreaChart';

type StockLevelCardProps = {
  title?: string;
  timeframe?: string;
  data?: Point[];
};

export default function StockLevelCard({
  title = 'Stock Level',
  timeframe = 'Last 30 days',
  data,
}: StockLevelCardProps) {
  // generate fallback dummy dataset if none provided
  const defaultData = useMemo(() => {
    // deterministic pseudo-random pattern with peaks and dips for visualization
    const base = 420;
    const points: Point[] = [];
    for (let i = 1; i <= 30; i++) {
      const seasonal = Math.round(120 * Math.sin((i / 30) * Math.PI * 2));
      const weekly = Math.round(60 * Math.cos((i / 7) * Math.PI * 2));
      const noise = Math.round((Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 12);
      const value = Math.max(12, base + seasonal + weekly + noise + (i % 5 === 0 ? 200 : 0));
      const label = i % 5 === 0 ? `${i}` : `${i}`;
      points.push({ label, value });
    }
    return points;
  }, []);

  const chartData = data ?? defaultData;

  const total = useMemo(() => chartData.reduce((s, p) => s + p.value, 0), [chartData]);
  const latest = chartData[chartData.length - 1]?.value ?? 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
        <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Compact, responsive area + line view</Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 10 }}>
        <AreaLineChart
            data={chartData}
          height={220}
          pointSpacing={34}
          minPointsToSample={10}
          maxPointsNoScroll={27}
          gradientFrom={'#FF8A65'}
          gradientTo={'rgba(255,138,101,0.06)'}
          strokeColor={'#E7600E'}
          onPointPress={(i, pt) => console.log('point', i, pt)}
        />
      </View>

      <View style={styles.footerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.dot} />
          <Text style={styles.footerText}>{`${(total).toLocaleString()} units across warehouses`}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.smallLabel}>{timeframe}</Text>
          <Text style={styles.bigValue}>{latest.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 8,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: '#222' },
  subtitle: { fontSize: 12, color: '#8b8b8b', marginTop: 4 },
  viewAllButton: {
    backgroundColor: '#FFF7F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewAllText: { color: '#E7600E', fontWeight: '700' },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 6, backgroundColor: '#FF8A65', marginRight: 8 },
  footerText: { color: '#6b6b6b', fontSize: 13 },
  smallLabel: { color: '#9b9b9b', fontSize: 12 },
  bigValue: { fontSize: 18, fontWeight: '900', color: '#222', marginTop: 4 },
});