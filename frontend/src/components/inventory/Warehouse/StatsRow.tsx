import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';

interface StatCard {
  id: number;
  icon: string;
  label: string;
  value: string;
  isAlert?: boolean;
  gradient?: string[];
}

const statCards: StatCard[] = [
  { id: 1, icon: 'home', label: 'Total Warehouses', value: '12' },
  { id: 2, icon: 'package', label: 'Total Stock', value: '24,890' },
  { id: 3, icon: 'repeat', label: 'Total Transfers', value: '1,240' },
  { id: 4, icon: 'shopping-cart', label: 'Total Items', value: '3,450' },
  { id: 5, icon: 'archive', label: 'Total Bins', value: '890' },
  { id: 6, icon: 'alert-triangle', label: 'Low Stock Alerts', value: '24', isAlert: true },
];

interface StatsRowProps {
  data?: StatCard[];
}

const StatsRow: React.FC<StatsRowProps> = ({ data = statCards }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {data.map((card) => (
          <View key={card.id} style={styles.cardWrapper}>
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <LinearGradient
                  colors={card.gradient || ['#FF7E5F', '#FD3A69']}
                  style={styles.iconCircle}
                >
                  <Icon name={card.icon} size={20} color="#FFF" />
                </LinearGradient>
                <View style={styles.textContainer}>
                  <Text style={styles.cardLabel} numberOfLines={2}>
                    {card.label}
                  </Text>
                  <Text
                    style={[
                      styles.cardValue,
                      card.isAlert ? styles.alertText : styles.normalText,
                    ]}
                  >
                    {card.value}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  cardWrapper: {
    width: '33.3333%',
    padding: SPACING.xs,
  },
  cardContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  card: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    height: 110,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  textContainer: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    lineHeight: 16,
  },
  cardValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  alertText: {
    color: COLORS.status.warning,
  },
  normalText: {
    color: COLORS.text.primary,
  },
});

export default StatsRow;
