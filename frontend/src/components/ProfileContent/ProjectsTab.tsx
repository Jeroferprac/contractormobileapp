import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

export const ProjectsTab: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.aboutText}>
          BuildRight Constructions is a licensed contracting company specializing in residential and commercial projects across the UAE.
        </Text>
        <TouchableOpacity>
          <Text style={styles.readMoreText}>Read more</Text>
        </TouchableOpacity>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services Offer:</Text>
        <View style={styles.servicesGrid}>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🍳</Text>
            <Text style={styles.serviceText}>Complete Kitchen Remodeling</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🛁</Text>
            <Text style={styles.serviceText}>Bathroom Renovation</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🏠</Text>
            <Text style={styles.serviceText}>Home Additions & Extensions</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🗄️</Text>
            <Text style={styles.serviceText}>Custom Cabinetry</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🎨</Text>
            <Text style={styles.serviceText}>Interior Design Services</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🏗️</Text>
            <Text style={styles.serviceText}>Structural Modifications</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>📋</Text>
            <Text style={styles.serviceText}>Permit Acquisition</Text>
          </View>
        </View>
      </View>

      {/* Highlights Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.highlightsGrid}>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>💎</Text>
            <Text style={styles.highlightText}>High-end</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.highlightText}>Family Owned</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>⭐</Text>
            <Text style={styles.highlightText}>Best of Binyaan Service</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: SPACING.md,
  },
  editButton: {
    padding: SPACING.xs,
  },
  editIcon: {
    fontSize: 16,
    color: '#FF6B35',
  },
  aboutText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  readMoreText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    width: '48%',
    minHeight: 50,
  },
  serviceIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  serviceText: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
    fontWeight: '500',
  },
  highlightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  highlightItem: {
    alignItems: 'center',
    flex: 1,
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  highlightText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
});
