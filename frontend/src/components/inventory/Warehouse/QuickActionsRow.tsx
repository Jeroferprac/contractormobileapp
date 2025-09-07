import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TouchableOpacityProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';

interface QuickAction {
  id: number;
  iconName: string;  // icon name string from Feather icons
  label: string;
  colors: string[];
  onPress?: () => void;
  testID?: string;
}

interface QuickActionsRowProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { 
    id: 1, 
    iconName: 'repeat', 
    label: 'Create Transfer', 
    colors: ['#FB7504', '#C2252C'],
    testID: 'create-transfer-btn'
  },
  { 
    id: 2, 
    iconName: 'home', 
    label: 'Add Warehouse', 
    colors: ['#FF5E3A', '#FF2A6D'],
    testID: 'add-warehouse-btn'
  },
  { 
    id: 3, 
    iconName: 'package', 
    label: 'Add Stock', 
    colors: ['#4F46E5', '#7C3AED'],
    testID: 'add-stock-btn'
  },
];

const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ actions = defaultActions }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={action.onPress}
            style={styles.buttonWrapper}
            activeOpacity={0.7}
            testID={action.testID}
          >
            <LinearGradient
              colors={action.colors}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.iconContainer}>
                <Icon name={action.iconName} size={24} color="white" />
              </View>
              <Text style={styles.buttonText}>{action.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -SPACING.xs, // Negative margin to offset padding
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  buttonText: {
    color: 'white',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default QuickActionsRow;
