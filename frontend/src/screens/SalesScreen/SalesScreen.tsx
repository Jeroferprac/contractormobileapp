import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';

import { inventoryApiService } from '../../api/inventoryApi';
import {
  Sale,
  SalesSummary,
  GroupedSalesSummary,
  TopCustomer,
} from '../../types/inventory';
import { SPACING } from '../../constants/spacing';
import SalesHeader from '../../components/inventory/Sales/SalesHeader';
import SalesChart, { SalesChartHandle } from '../../components/inventory/Sales/SalesChart';
import SalesCustomers from '../../components/inventory/Sales/SalesCustomers';
import SalesList from '../../components/inventory/Sales/SalesList';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import SectionHeader from '../../components/layout/SectionHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SalesScreenProps {
  navigation: any;
}

const SalesScreen: React.FC<SalesScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedSalesSummary[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  
  // Chart states
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const loadSalesData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 SalesScreen: Loading data...');
      
      const [salesRes, summaryRes, groupedRes, topCustomersRes] = await Promise.allSettled([
        inventoryApiService.getSales({ limit: 5, page: 1 }), // Get recent 5 sales
        inventoryApiService.getSalesSummary(),
        inventoryApiService.getSalesSummaryGrouped({ group_by: selectedTimeframe }),
        inventoryApiService.getTopCustomers(),
      ]);

      // Handle sales data
      if (salesRes.status === 'fulfilled' && salesRes.value.data) {
        // Backend returns array directly, not wrapped in data object
        const salesData = Array.isArray(salesRes.value.data) ? salesRes.value.data : [];
        setSales(salesData);
        console.log('✅ SalesScreen: Sales loaded:', salesData.length);
      } else {
        // Fallback data if API fails
        const fallbackSales = [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            sale_number: 'SALE-001',
            customer_id: '550e8400-e29b-41d4-a716-446655440002',
            customer_name: 'John Doe',
            sale_date: '2024-01-15',
            due_date: '2024-01-30',
            subtotal: '1500.00',
            tax_amount: '150.00',
            discount_amount: '0.00',
            total_amount: '1650.00',
            paid_amount: '1650.00',
            status: 'completed',
            payment_status: 'paid',
            shipping_address: '123 Main St, City, State',
            created_by: '550e8400-e29b-41d4-a716-446655440003',
            shipped_at: undefined,
            overdue_days: 0,
            items: [
              {
                id: '550e8400-e29b-41d4-a716-446655440004',
                sale_id: '550e8400-e29b-41d4-a716-446655440001',
                product_id: '550e8400-e29b-41d4-a716-446655440005',
                product_name: 'Product A',
                quantity: 2,
                unit_price: 750.00,
                discount: 0.00,
                tax: 75.00,
                total_price: 825.00,
              }
            ]
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440006',
            sale_number: 'SALE-002',
            customer_id: '550e8400-e29b-41d4-a716-446655440007',
            customer_name: 'Jane Smith',
            sale_date: '2024-01-14',
            due_date: '2024-01-29',
            subtotal: '2200.00',
            tax_amount: '220.00',
            discount_amount: '100.00',
            total_amount: '2320.00',
            paid_amount: '2320.00',
            status: 'completed',
            payment_status: 'paid',
            shipping_address: '456 Oak Ave, City, State',
            created_by: '550e8400-e29b-41d4-a716-446655440003',
            shipped_at: undefined,
            overdue_days: 0,
            items: [
              {
                id: '550e8400-e29b-41d4-a716-446655440008',
                sale_id: '550e8400-e29b-41d4-a716-446655440006',
                product_id: '550e8400-e29b-41d4-a716-446655440009',
                product_name: 'Product B',
                quantity: 1,
                unit_price: 2200.00,
                discount: 100.00,
                tax: 220.00,
                total_price: 2320.00,
              }
            ]
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            sale_number: 'SALE-003',
            customer_id: '550e8400-e29b-41d4-a716-446655440011',
            customer_name: 'Mike Johnson',
            sale_date: '2024-01-13',
            due_date: '2024-01-28',
            subtotal: '800.00',
            tax_amount: '80.00',
            discount_amount: '0.00',
            total_amount: '880.00',
            paid_amount: '0.00',
            status: 'pending',
            payment_status: 'unpaid',
            shipping_address: '789 Pine Rd, City, State',
            created_by: '550e8400-e29b-41d4-a716-446655440003',
            shipped_at: undefined,
            overdue_days: 0,
            items: [
              {
                id: '550e8400-e29b-41d4-a716-446655440012',
                sale_id: '550e8400-e29b-41d4-a716-446655440010',
                product_id: '550e8400-e29b-41d4-a716-446655440013',
                product_name: 'Product C',
                quantity: 1,
                unit_price: 800.00,
                discount: 0.00,
                tax: 80.00,
                total_price: 880.00,
              }
            ]
          }
        ];
        setSales(fallbackSales);
        console.log('⚠️ SalesScreen: Using fallback sales data');
      }

      // Handle summary data
      if (summaryRes.status === 'fulfilled' && summaryRes.value.data) {
        setSummary(summaryRes.value.data);
        console.log('✅ SalesScreen: Summary loaded');
      }

      // Handle grouped data
      if (groupedRes.status === 'fulfilled' && groupedRes.value.data) {
        setGroupedData(groupedRes.value.data);
        console.log('✅ SalesScreen: Grouped data loaded:', groupedRes.value.data.length);
      }

      // Handle top customers data
      if (topCustomersRes.status === 'fulfilled') {
        const customersData = topCustomersRes.value.data || topCustomersRes.value || [];
        setTopCustomers(customersData);
        console.log('✅ SalesScreen: Top customers loaded:', customersData.length);
      } else {
        // Fallback data if API fails
        const fallbackCustomers = [
          {
            customer_id: '1',
            customer_name: 'John Doe',
            total_sales: 15647.25,
            percentage_of_total_sales: 32.08,
          },
          {
            customer_id: '2',
            customer_name: 'Jane Smith',
            total_sales: 12456.80,
            percentage_of_total_sales: 25.54,
          },
          {
            customer_id: '3',
            customer_name: 'Mike Johnson',
            total_sales: 9876.50,
            percentage_of_total_sales: 20.25,
          },
        ];
        setTopCustomers(fallbackCustomers);
        console.log('⚠️ SalesScreen: Using fallback customers data');
      }

    } catch (error) {
      console.error('❌ SalesScreen: Error loading data:', error);
      Alert.alert('Error', 'Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSalesData();
    setRefreshing(false);
  }, [loadSalesData]);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);





  const handleTimeframeChange = (timeframe: 'daily' | 'weekly' | 'monthly') => {
    setSelectedTimeframe(timeframe);
  };

  const handlePlaceOrder = () => {
    navigation.navigate('CreateSale');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewAllSales = () => {
    navigation.navigate('AllSales');
  };

  const handleSalePress = (sale: Sale) => {
    navigation.navigate('SalesDetails', { saleId: sale.id });
  };

  const chartRef = useRef<SalesChartHandle | null>(null);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.loadingContainer}>
            <LoadingSkeleton height={120} borderRadius={16} />
            <View style={styles.loadingGrid}>
              {[1, 2, 3].map((index) => (
                <LoadingSkeleton key={index} height={100} borderRadius={16} />
              ))}
            </View>
            <LoadingSkeleton height={200} borderRadius={16} />
            <LoadingSkeleton height={150} borderRadius={16} />
            <LoadingSkeleton height={300} borderRadius={16} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <SalesHeader 
          onPlaceOrder={handlePlaceOrder}
          onBackPress={handleBackPress}
          totalSales={summary?.total_sales || 0}
          totalRevenue={summary?.total_revenue || 0}
          salesThisMonth={sales?.length || 0}
          lastSaleDate={summary?.latest_sale}
        />

        {/* Sales Chart */}
        <SectionHeader 
          title="Sales Performance" 
          subtitle="Track your revenue trends" 
          showViewAll={false} 
          style={{ marginTop: SPACING.sm, marginBottom: SPACING.sm }}
          rightContent={(
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ padding: 8, borderRadius: 12, backgroundColor: '#E9ECEF', marginRight: 8 }} onPress={() => chartRef.current?.zoomIn()} activeOpacity={0.7}>
                <Icon name="zoom-in" size={16} color="#FF6B35" />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 8, borderRadius: 12, backgroundColor: '#E9ECEF', marginRight: 8 }} onPress={() => chartRef.current?.zoomOut()} activeOpacity={0.7}>
                <Icon name="zoom-out" size={16} color="#FF6B35" />
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#FF6B35', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 }} onPress={() => chartRef.current?.share()} activeOpacity={0.7}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>SHARE</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <SalesChart
          ref={chartRef}
          data={groupedData}
          timeframe={selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
          showTitleInside={false}
        />

        {/* Top Customers */}
        <SalesCustomers customers={topCustomers} />

        {/* Recent Sales */}
        <SalesList
          sales={sales}
          title="Recent Sales"
          showViewAll={true}
          onViewAll={handleViewAllSales}
          onSalePress={handleSalePress}
          navigation={navigation}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  loadingGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});

export default SalesScreen;
