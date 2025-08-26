import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { extractApiErrorMessage } from '../../utils/errorHandler';
import Sidebar from '../../components/ui/Sidebar';

const { width, height } = Dimensions.get('window');

// Responsive font sizes
const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  large: 32,
};

import {
  SearchBar,
  LoadingSkeleton,
  FadeSlideInView,
} from '../../components/ui';
import { Button } from '../../components/Button';

import { Supplier } from '../../types/inventory';
import { SuppliersScreenNavigationProp } from '../../types/navigation';
import inventoryApiService from '../../api/inventoryApi';

interface SuppliersScreenProps {
  navigation: SuppliersScreenNavigationProp;
}

const SuppliersScreen: React.FC<SuppliersScreenProps> = ({ navigation }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [deletingSupplierId, setDeletingSupplierId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Refresh suppliers when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSuppliers();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterSuppliers();
  }, [searchText, suppliers]);

  const loadSuppliers = async () => {
    try {
      console.log('🔄 [SuppliersScreen] Loading suppliers...');
      setLoading(true);
      
      const response = await inventoryApiService.getSuppliers();
      setSuppliers(response.data || []);
      console.log('✅ [SuppliersScreen] Loaded suppliers:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ [SuppliersScreen] Error loading suppliers:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    if (!searchText.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.phone.includes(searchText)
    );
    setFilteredSuppliers(filtered);
  };

  const handleSupplierPress = (supplier: Supplier) => {
    navigation.navigate('SupplierDetails', { supplierId: supplier.id });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    navigation.navigate('SupplierForm', { supplier, isEditing: true });
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
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
              setDeletingSupplierId(supplier.id);
              console.log('🔄 [SuppliersScreen] Deleting supplier:', supplier.id);
              
              await inventoryApiService.deleteSupplier(supplier.id);
              
              console.log('✅ [SuppliersScreen] Supplier deleted successfully');
              setSuppliers(suppliers.filter(s => s.id !== supplier.id));
              
              Alert.alert('Success', `Supplier "${supplier.name}" has been deleted successfully`);
            } catch (error: any) {
              console.error('❌ [SuppliersScreen] Error deleting supplier:', error);
              
              // Log the response details if available
              if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
              }
              
              // Show more specific error message
              let errorMessage = 'Failed to delete supplier. Please try again.';
              if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
              } else {
                errorMessage = extractApiErrorMessage(error, 'Failed to delete supplier. Please try again.');
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setDeletingSupplierId(null);
            }
          }
        },
      ]
    );
  };

  const handleAddSupplier = () => {
    navigation.navigate('SupplierForm', { isEditing: false });
  };

  const renderSupplierItem = ({ item, index }: { item: Supplier; index: number }) => (
    <FadeSlideInView delay={index * 100}>
      <TouchableOpacity
        style={styles.supplierItem}
        activeOpacity={0.9}
        onPress={() => handleSupplierPress(item)}
      >
        <LinearGradient
          colors={getSupplierCardColors(index)}
          style={styles.itemCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Card Header with Status and Actions */}
          <View style={styles.cardHeader}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.is_active ? '#10B981' : '#EF4444' }
                ]}
              />
              <Text style={styles.statusText}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            {deletingSupplierId === item.id ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <View style={styles.iconContainer}>
                <Icon name="business" size={24} color="#6366F1" />
              </View>
            )}
          </View>

          {/* Supplier Name with Enhanced Styling */}
          <View style={styles.supplierNameContainer}>
          <Text style={styles.supplierName}>{item.name}</Text>
            <View style={styles.supplierBadge}>
              <Icon name="verified" size={16} color="#10B981" />
              <Text style={styles.supplierBadgeText}>Verified</Text>
            </View>
          </View>

          {/* Contact Information Grid */}
          <View style={styles.contactGrid}>
            <View style={styles.contactItem}>
              <View style={styles.iconWrapper}>
                <Icon name="person" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Contact</Text>
                <Text style={styles.contactText} numberOfLines={1}>{item.contact_person}</Text>
              </View>
          </View>

            <View style={styles.contactItem}>
              <View style={styles.iconWrapper}>
                <Icon name="email" size={18} color="#06B6D4" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
              </View>
          </View>

            <View style={styles.contactItem}>
              <View style={styles.iconWrapper}>
                <Icon name="phone" size={18} color="#10B981" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactText} numberOfLines={1}>{item.phone}</Text>
              </View>
          </View>

          {item.tax_number && (
              <View style={styles.contactItem}>
                <View style={styles.iconWrapper}>
                  <Icon name="receipt" size={18} color="#F59E0B" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Tax ID</Text>
                  <Text style={styles.contactText} numberOfLines={1}>{item.tax_number}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Additional Info Row */}
          <View style={styles.additionalInfoRow}>
            {item.payment_terms && (
              <View style={styles.infoChip}>
                <Icon name="schedule" size={14} color="#6366F1" />
                <Text style={styles.infoChipText}>{item.payment_terms}</Text>
              </View>
            )}
            {item.credit_limit && (
              <View style={styles.infoChip}>
                <Icon name="account-balance-wallet" size={14} color="#10B981" />
                <Text style={styles.infoChipText}>€{item.credit_limit.toLocaleString()}</Text>
            </View>
          )}
          </View>

          {/* Card Footer with Action Hint */}
          <View style={styles.cardFooter}>
            <View style={styles.actionHint}>
              <Icon name="touch-app" size={16} color="#6B7280" />
              <Text style={styles.actionHintText}>Tap to view • Long press for options</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </FadeSlideInView>
  );

  const getSupplierCardColors = (index: number) => {
    const colorSchemes = [
      [COLORS.card || '#FFFFFF', COLORS.surface || '#F8F9FA', '#F8F9FA'],
      [COLORS.card || '#FFFFFF', '#FFF8E1', '#FFF3E0'],
      [COLORS.card || '#FFFFFF', '#E8F5E8', '#E0F2E0'],
      [COLORS.card || '#FFFFFF', '#FFF3E0', '#FFE0B2'],
      [COLORS.card || '#FFFFFF', '#E3F2FD', '#BBDEFB'],
      [COLORS.card || '#FFFFFF', '#F3E5F5', '#E1BEE7'],
    ];
    return colorSchemes[index % colorSchemes.length];
  };

  if (hasError) {
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
              onPress={() => setSidebarVisible(true)}
            >
              <Icon name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Suppliers</Text>
              <Text style={styles.headerSubtitle}>Manage your business partners</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={() => navigation.navigate('PurchaseOrders')}
              >
                <Icon name="receipt" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={() => navigation.navigate('ProductSuppliers')}
              >
                <Icon name="link" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddSupplier}
              >
                <Icon name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            style={styles.emptyCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emptyIconContainer}>
              <Icon name="error" size={80} color="#EF4444" />
            </View>
            <Text style={styles.emptyTitle}>Failed to Load Suppliers</Text>
            <Text style={styles.emptySubtitle}>
              There was an error connecting to the server. Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} onPress={loadSuppliers}>
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.emptyActionText}>Retry</Text>
          </TouchableOpacity>
          </LinearGradient>
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
             onPress={() => setSidebarVisible(true)}
           >
             <Icon name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
           <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Suppliers</Text>
             <Text style={styles.headerSubtitle}>Manage your business partners</Text>
           </View>
           <View style={styles.headerActions}>
             <TouchableOpacity 
               style={styles.headerActionButton}
               onPress={() => navigation.navigate('PurchaseOrders')}
             >
               <Icon name="receipt" size={20} color="#FFFFFF" />
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.headerActionButton}
               onPress={() => navigation.navigate('ProductSuppliers')}
             >
               <Icon name="link" size={20} color="#FFFFFF" />
             </TouchableOpacity>
             <TouchableOpacity 
               style={styles.addButton}
               onPress={handleAddSupplier}
             >
               <Icon name="add" size={24} color="#FFFFFF" />
             </TouchableOpacity>
           </View>
        </View>
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search suppliers..."
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={() => {}}
          />
        </View>
      </LinearGradient>

      {/* Top Matches Section */}
      {!loading && filteredSuppliers.length > 0 && (
        <View style={styles.topMatchesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>🏆 Top Matches</Text>
              <View style={styles.matchesBadge}>
                <Text style={styles.matchesBadgeText}>BEST</Text>
              </View>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topMatchesContainer}
          >
            {filteredSuppliers.slice(0, 3).map((supplier, index) => (
              <FadeSlideInView key={supplier.id} delay={index * 100}>
                <TouchableOpacity
                  style={styles.topMatchCard}
                  activeOpacity={0.9}
                  onPress={() => handleSupplierPress(supplier)}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.topMatchGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.topMatchHeader}>
                      <View style={styles.topMatchRank}>
                        <Text style={styles.topMatchRankText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.topMatchStatus}>
                        <View style={[
                          styles.topMatchStatusDot,
                          { backgroundColor: supplier.is_active ? '#10B981' : '#EF4444' }
                        ]} />
                        <Text style={styles.topMatchStatusText}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.topMatchContent}>
                      <Icon name="business" size={32} color="#FFFFFF" />
                      <Text style={styles.topMatchName} numberOfLines={1}>
                        {supplier.name}
                      </Text>
                      <Text style={styles.topMatchContact} numberOfLines={1}>
                        {supplier.contact_person}
                      </Text>
                    </View>

                    <View style={styles.topMatchFooter}>
                      <View style={styles.topMatchInfo}>
                        <Icon name="email" size={14} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.topMatchInfoText} numberOfLines={1}>
                          {supplier.email}
                        </Text>
                      </View>
                      {supplier.credit_limit && (
                        <View style={styles.topMatchInfo}>
                          <Icon name="account-balance-wallet" size={14} color="rgba(255, 255, 255, 0.8)" />
                          <Text style={styles.topMatchInfoText}>
                            €{supplier.credit_limit.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </FadeSlideInView>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ScrollView style={styles.content}>
          {[...Array(6)].map((_, index) => (
            <View key={index} style={styles.skeletonItem}>
              <LoadingSkeleton height={120} borderRadius={BORDER_RADIUS.lg} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <LinearGradient
                 colors={['#F8FAFC', '#E2E8F0']}
                 style={styles.emptyCard}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                 <View style={styles.emptyIconContainer}>
                   <Icon name="business" size={80} color="#94A3B8" />
                 </View>
              <Text style={styles.emptyTitle}>No Suppliers Found</Text>
              <Text style={styles.emptySubtitle}>
                   {searchText ? 'Try adjusting your search criteria' : 'Start building your supplier network'}
              </Text>
                 {!searchText && (
                   <TouchableOpacity style={styles.emptyActionButton} onPress={handleAddSupplier}>
                     <Icon name="add" size={20} color="#FFFFFF" />
                     <Text style={styles.emptyActionText}>Add First Supplier</Text>
                   </TouchableOpacity>
                 )}
               </LinearGradient>
            </View>
          }
        />
      )}

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={(screen) => navigation.navigate(screen as any)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: SPACING.xl + 20, // Add extra padding for status bar
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: FONTS.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerActionButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  supplierItem: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  itemCard: {
    padding: SPACING.md,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.sm,
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
    fontSize: FONTS.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#374151',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  supplierNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  supplierName: {
    fontSize: FONTS.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1F2937',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  supplierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  supplierBadgeText: {
    fontSize: FONTS.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#10B981',
  },
  contactGrid: {
    gap: SPACING.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 1,
  },
  contactText: {
    fontSize: FONTS.md,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  additionalInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    gap: SPACING.xs,
  },
  infoChipText: {
    fontSize: FONTS.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cardFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHintText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  skeletonItem: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: FONTS.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: FONTS.xl,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  // Top Matches Section Styles
  topMatchesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    fontSize: FONTS.xl,
    fontWeight: '700',
    flex: 1,
  },
  matchesBadge: {
    backgroundColor: '#fdcb6e',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  matchesBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#d63031',
    fontSize: FONTS.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topMatchesContainer: {
    paddingRight: SPACING.lg,
  },
  topMatchCard: {
    width: 200,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  topMatchGradient: {
    padding: SPACING.lg,
    minHeight: 160,
  },
  topMatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  topMatchRank: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  topMatchRankText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontSize: FONTS.sm,
    fontWeight: '700',
  },
  topMatchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topMatchStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  topMatchStatusText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONTS.xs,
    fontWeight: '500',
  },
  topMatchContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  topMatchName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    fontSize: FONTS.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  topMatchContact: {
    ...TYPOGRAPHY.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONTS.sm,
    textAlign: 'center',
  },
  topMatchFooter: {
    gap: SPACING.xs,
  },
  topMatchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  topMatchInfoText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONTS.xs,
    flex: 1,
  },
});

export default SuppliersScreen;
