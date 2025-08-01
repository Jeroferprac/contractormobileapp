import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const quickActions = [
    { id: 1, title: 'Book Service', icon: 'build', color: '#FF6B35' },
    { id: 2, title: 'Find Pros', icon: 'person-search', color: '#4CAF50' },
    { id: 3, title: 'Get Quote', icon: 'attach-money', color: '#2196F3' },
    { id: 4, title: 'Emergency', icon: 'emergency', color: '#F44336' },
  ];

  const recentServices = [
    { id: 1, title: 'Plumbing Repair', status: 'Completed', date: '2 days ago' },
    { id: 2, title: 'Electrical Work', status: 'In Progress', date: '1 week ago' },
    { id: 3, title: 'HVAC Service', status: 'Scheduled', date: 'Next week' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.name}>Welcome back</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Icon name="person" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={() => console.log(`Pressed ${action.title}`)}
              >
                <Icon name={action.icon} size={32} color="white" />
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDate}>{service.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: service.status === 'Completed' ? '#4CAF50' : 
                  service.status === 'In Progress' ? '#FF9800' : '#2196F3' }
              ]}>
                <Text style={styles.statusText}>{service.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Featured Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <View style={styles.featuredServices}>
            <View style={styles.featuredCard}>
              <Text style={styles.featuredIcon}>🏠</Text>
              <Text style={styles.featuredTitle}>Home Renovation</Text>
              <Text style={styles.featuredDescription}>Transform your space with expert contractors</Text>
            </View>
            <View style={styles.featuredCard}>
              <Text style={styles.featuredIcon}>🔧</Text>
              <Text style={styles.featuredTitle}>Emergency Repairs</Text>
              <Text style={styles.featuredDescription}>24/7 emergency service available</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            title="Book Your First Service"
            onPress={() => console.log('Book service pressed')}
            variant="gradient"
            size="large"
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    width: '48%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  featuredServices: {
    gap: SPACING.md,
  },
  featuredCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  featuredDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  ctaButton: {
    width: '100%',
  },
});

export default HomeScreen;
