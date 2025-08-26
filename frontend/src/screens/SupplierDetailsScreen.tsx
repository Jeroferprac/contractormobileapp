import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { Supplier } from '../types/inventory';
import { SuppliersScreenNavigationProp } from '../types/navigation';
import inventoryApiService from '../api/inventoryApi';

interface SupplierDetailsScreenProps {
  navigation: SuppliersScreenNavigationProp;
  route: {
    params: {
      supplierId: string;
    };
  };
}

const SupplierDetailsScreen: React.FC<SupplierDetailsScreenProps> = ({ navigation, route }) => {
  const { supplierId } = route.params;
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSupplierDetails();
  }, [supplierId]);

  const loadSupplierDetails = async () => {
    try {
      setLoading(true);
      const response = await inventoryApiService.getSupplierById(supplierId);
      setSupplier(response.data);
    } catch (error) {
      console.error('Error loading supplier details:', error);
      Alert.alert('Error', 'Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (supplier) {
      navigation.navigate('SupplierForm', { supplier, isEditing: true });
    }
  };

  const handleDelete = () => {
    if (!supplier) return;

    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplier.name}"?\n\nThis action cannot be undone and will permanently remove this supplier from your system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              console.log('🔄 [SupplierDetailsScreen] Deleting supplier:', supplierId);
              
              await inventoryApiService.deleteSupplier(supplierId);
              
              console.log('✅ [SupplierDetailsScreen] Supplier deleted successfully');
              Alert.alert('Success', `Supplier "${supplier.name}" has been deleted successfully`, [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('❌ [SupplierDetailsScreen] Error deleting supplier:', error);
              
              // Log the response details if available
              if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
              }
              
              // Show more specific error message
              let errorMessage = 'Failed to delete supplier. Please try again.';
              if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Supplier Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading supplier details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!supplier) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Supplier Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={COLORS.text.tertiary} />
          <Text style={styles.errorTitle}>Supplier Not Found</Text>
          <Text style={styles.errorSubtitle}>The supplier you're looking for doesn't exist or has been deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                   <LinearGradient 
        colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
         <View style={styles.header}>
           <TouchableOpacity 
             style={styles.headerButton}
             onPress={() => navigation.goBack()}
           >
             <Icon name="arrow-back" size={24} color="#FFFFFF" />
           </TouchableOpacity>
           <View style={styles.headerTitleContainer}>
             <Text style={styles.headerTitle}>Supplier Details</Text>
             <Text style={styles.headerSubtitle}>View supplier information</Text>
           </View>
                       <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={handleEdit} 
                disabled={deleting}
              >
                <Icon name="edit" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="delete" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
         </View>
       </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                         <LinearGradient
          colors={[COLORS.card || '#FFFFFF', COLORS.surface || '#F8F9FA', '#F8F9FA']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
           <View style={styles.cardHeader}>
             <View style={styles.statusContainer}>
                               <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: supplier.is_active ? COLORS.status.success : COLORS.status.error }
                  ]}
                />
               <Text style={styles.statusText}>
                 {supplier.is_active ? 'Active' : 'Inactive'}
               </Text>
             </View>
                           <View style={styles.iconContainer}>
                <Icon name="business" size={28} color={COLORS.primary} />
              </View>
           </View>

           <Text style={styles.supplierName}>{supplier.name}</Text>

                     <View style={styles.infoSection}>
             <Text style={styles.sectionTitle}>Contact Information</Text>
             
             <View style={styles.infoRow}>
                               <View style={styles.iconWrapper}>
                  <Icon name="person" size={20} color={COLORS.primary} />
                </View>
               <View style={styles.infoContent}>
                 <Text style={styles.infoLabel}>Contact Person</Text>
                 <Text style={styles.infoValue}>{supplier.contact_person}</Text>
               </View>
             </View>

             <View style={styles.infoRow}>
                               <View style={styles.iconWrapper}>
                  <Icon name="email" size={20} color={COLORS.status.info} />
                </View>
               <View style={styles.infoContent}>
                 <Text style={styles.infoLabel}>Email</Text>
                 <Text style={styles.infoValue}>{supplier.email}</Text>
               </View>
             </View>

             <View style={styles.infoRow}>
                               <View style={styles.iconWrapper}>
                  <Icon name="phone" size={20} color={COLORS.status.success} />
                </View>
               <View style={styles.infoContent}>
                 <Text style={styles.infoLabel}>Phone</Text>
                 <Text style={styles.infoValue}>{supplier.phone}</Text>
               </View>
             </View>

             <View style={styles.infoRow}>
                               <View style={styles.iconWrapper}>
                  <Icon name="location-on" size={20} color={COLORS.status.warning} />
                </View>
               <View style={styles.infoContent}>
                 <Text style={styles.infoLabel}>Address</Text>
                 <Text style={styles.infoValue}>{supplier.address}</Text>
               </View>
             </View>
           </View>

                     <View style={styles.infoSection}>
             <Text style={styles.sectionTitle}>Additional Information</Text>
             
             {supplier.tax_number && (
               <View style={styles.infoRow}>
                                   <View style={styles.iconWrapper}>
                    <Icon name="receipt" size={20} color={COLORS.status.warning} />
                  </View>
                 <View style={styles.infoContent}>
                   <Text style={styles.infoLabel}>Tax Number</Text>
                   <Text style={styles.infoValue}>{supplier.tax_number}</Text>
                 </View>
               </View>
             )}

             {supplier.payment_terms && (
               <View style={styles.infoRow}>
                                   <View style={styles.iconWrapper}>
                    <Icon name="schedule" size={20} color={COLORS.primary} />
                  </View>
                 <View style={styles.infoContent}>
                   <Text style={styles.infoLabel}>Payment Terms</Text>
                   <Text style={styles.infoValue}>{supplier.payment_terms}</Text>
                 </View>
               </View>
             )}

             {supplier.credit_limit && (
               <View style={styles.infoRow}>
                                   <View style={styles.iconWrapper}>
                    <Icon name="account-balance-wallet" size={20} color={COLORS.status.success} />
                  </View>
                 <View style={styles.infoContent}>
                   <Text style={styles.infoLabel}>Credit Limit</Text>
                   <Text style={styles.infoValue}>€{supplier.credit_limit.toLocaleString()}</Text>
                 </View>
               </View>
             )}
           </View>

                     <View style={styles.infoSection}>
             <Text style={styles.sectionTitle}>System Information</Text>
             
             <View style={styles.infoRow}>
                               <View style={styles.iconWrapper}>
                  <Icon name="calendar-today" size={20} color={COLORS.primary} />
                </View>
               <View style={styles.infoContent}>
                 <Text style={styles.infoLabel}>Created</Text>
                 <Text style={styles.infoValue}>
                   {new Date(supplier.created_at).toLocaleDateString()}
                 </Text>
               </View>
             </View>

             <View style={styles.infoRow}>
                               <View style={styles.iconWrapper}>
                  <Icon name="update" size={20} color={COLORS.status.info} />
                </View>
               <View style={styles.infoContent}>
                 <Text style={styles.infoLabel}>Last Updated</Text>
                 <Text style={styles.infoValue}>
                   {new Date(supplier.updated_at).toLocaleDateString()}
                 </Text>
               </View>
             </View>
           </View>
         </LinearGradient>

        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: SPACING.lg + 20, // Add extra padding for status bar
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerActionButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorSubtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  supplierName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  infoSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.primary,
    lineHeight: 24,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

});

export default SupplierDetailsScreen;
