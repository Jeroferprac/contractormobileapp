import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { BarChart } from 'react-native-gifted-charts';
import Svg, { Circle, Polygon } from 'react-native-svg';
// import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Transfer, TransferStatus, Warehouse, Product } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';
import { AllTransfersScreenNavigationProp } from '../../types/navigation';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import FilterModal from '../../components/ui/FilterModal';
import ExportModal from '../../components/inventory/Warehouse/ExportModal';
import TransferCard from '../../components/inventory/Warehouse/TransferCard';
import TransferForm from '../../components/inventory/Warehouse/TransferForm';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

interface AllTransfersScreenProps {
  navigation: AllTransfersScreenNavigationProp;
}

const AllTransfersScreen: React.FC<AllTransfersScreenProps> = ({ navigation }) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [contentAnimation] = useState(new Animated.Value(1));
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<TransferStatus | 'all'>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));
  
  // Filter and Export Modals
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // Export States
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Premium gradient colors with 4 colors each
  const gradientColors = [
    ['#FF6B35', '#FF8C42', '#FFA500', '#FFD700'], // Orange
    ['#EF4444', '#F87171', '#DC2626', '#B91C1C'], // Red
    ['#EC4899', '#F472B6', '#DB2777', '#BE185D'], // Pink
    ['#F59E0B', '#FBBF24', '#D97706', '#B45309'], // Yellow
    ['#3B82F6', '#60A5FA', '#2563EB', '#1D4ED8'], // Blue
    ['#8B5CF6', '#A78BFA', '#7C3AED', '#6D28D9'], // Purple
  ];

  // Responsive spacing
  const responsiveSpacing = useMemo(() => ({
    horizontal: isTablet ? SPACING.xl : SPACING.lg,
    cardPadding: isTablet ? SPACING.xl : SPACING.lg,
    chartWidth: isTablet ? screenWidth - 120 : screenWidth - 80,
    chartHeight: isTablet ? 100 : 80,
  }), []);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const [transfersResponse, warehousesResponse, productsResponse] = await Promise.all([
        inventoryApiService.getTransfers(),
        inventoryApiService.getWarehouses(),
        inventoryApiService.getProducts(),
      ]);
      
      console.log('API Responses:', {
        transfers: transfersResponse.data?.length || 0,
        warehouses: warehousesResponse.data?.length || 0,
        products: productsResponse.data?.length || 0
      });
      
      setTransfers(transfersResponse.data);
      setWarehouses(warehousesResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseName = (warehouseId: string): string => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || 'Unknown Warehouse';
  };

  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const getTransferGradient = (transfer: Transfer): string[] => {
    const index = transfers.indexOf(transfer) % gradientColors.length;
    return gradientColors[index];
  };

  const getCurrentGradient = (): string[] => {
    // Safety check - ensure gradientColors is available
    if (!gradientColors || gradientColors.length === 0) {
      return ['#3B82F6', '#60A5FA', '#2563EB', '#1D4ED8']; // Default blue gradient
    }
    
    if (selectedTransfer) {
      return getTransferGradient(selectedTransfer);
    }
    // Dynamic gradient based on current time - cycles through all gradient sets
    const index = Math.floor(Date.now() / 15000) % gradientColors.length;
    return gradientColors[index];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_transit':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalTransferAmount = (): number => {
    return transfers.reduce((total, transfer) => {
      const transferTotal = transfer.items.reduce((sum, item) => {
        return sum + (parseInt(item.quantity.toString()) || 0);
      }, 0);
      return total + transferTotal;
    }, 0);
  };

  const getTransferTotal = (transfer: Transfer): number => {
    return transfer.items.reduce((sum, item) => sum + (parseInt(item.quantity.toString()) || 0), 0);
  };

  // Enhanced filtered transfers with warehouse and date range
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const fromWarehouse = getWarehouseName(transfer.from_warehouse_id);
      const toWarehouse = getWarehouseName(transfer.to_warehouse_id);
      
      // Search filter
      const searchMatch = searchText === '' || 
        fromWarehouse.toLowerCase().includes(searchText.toLowerCase()) ||
        toWarehouse.toLowerCase().includes(searchText.toLowerCase()) ||
        transfer.id.toLowerCase().includes(searchText.toLowerCase());
      
      // Status filter
      const statusMatch = filterStatus === 'all' || transfer.status === filterStatus;
      
      // Warehouse filter
      const warehouseMatch = selectedWarehouse === 'all' || 
        transfer.from_warehouse_id === selectedWarehouse ||
        transfer.to_warehouse_id === selectedWarehouse;
      
      // Date range filter
      let dateMatch = true;
      if (dateRange.start && dateRange.end) {
        const transferDate = new Date(transfer.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        dateMatch = transferDate >= startDate && transferDate <= endDate;
      }
      
      return searchMatch && statusMatch && warehouseMatch && dateMatch;
    });
  }, [transfers, searchText, filterStatus, selectedWarehouse, dateRange, warehouses]);

  const handleTransferPress = useCallback((transfer: Transfer) => {
    setSelectedTransfer(transfer);
    Animated.timing(contentAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [contentAnimation]);

  const handleBackToOverview = useCallback(() => {
    Animated.timing(contentAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedTransfer(null);
    });
  }, [contentAnimation]);

  const handleBackPress = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Inventory' });
  }, [navigation]);

  const toggleSearch = useCallback(() => {
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchText('');
    }
  }, [showSearch, searchAnimation]);

  // Real Export Functions
  const generateCSV = useCallback((transfers: Transfer[]): string => {
    const headers = [
      'Transfer ID',
      'From Warehouse',
      'To Warehouse',
      'Status',
      'Total Quantity',
      'Products',
      'Created Date',
      'Notes'
    ].join(',');

    const rows = transfers.map(transfer => {
      const fromWarehouse = getWarehouseName(transfer.from_warehouse_id);
      const toWarehouse = getWarehouseName(transfer.to_warehouse_id);
      const totalQuantity = getTransferTotal(transfer);
      const products = transfer.items.map(item => getProductName(item.product_id)).join('; ');
      
      return [
        transfer.id,
        `"${fromWarehouse}"`,
        `"${toWarehouse}"`,
        transfer.status,
        totalQuantity,
        `"${products}"`,
        new Date(transfer.created_at).toLocaleDateString(),
        `"${transfer.notes || ''}"`
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }, [warehouses, products]);

  const generatePDFContent = useCallback((transfers: Transfer[]): string => {
    const totalTransfers = transfers.length;
    const totalQuantity = transfers.reduce((sum, transfer) => sum + getTransferTotal(transfer), 0);
    
    const transferRows = transfers.map(transfer => {
      const fromWarehouse = getWarehouseName(transfer.from_warehouse_id);
      const toWarehouse = getWarehouseName(transfer.to_warehouse_id);
      const totalQuantity = getTransferTotal(transfer);
      const products = transfer.items.map(item => getProductName(item.product_id)).join(', ');
      
      return `
        <tr>
          <td>${transfer.id.slice(0, 8)}</td>
          <td>${fromWarehouse}</td>
          <td>${toWarehouse}</td>
          <td>${transfer.status}</td>
          <td>${totalQuantity}</td>
          <td>${products}</td>
          <td>${new Date(transfer.created_at).toLocaleDateString()}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Transfer Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-pending { color: #F59E0B; }
            .status-completed { color: #10B981; }
            .status-in_transit { color: #3B82F6; }
            .status-cancelled { color: #EF4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Transfer Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Transfers:</strong> ${totalTransfers}</p>
            <p><strong>Total Quantity:</strong> ${totalQuantity} units</p>
            <p><strong>Date Range:</strong> ${dateRange.start || 'All'} to ${dateRange.end || 'All'}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>From Warehouse</th>
                <th>To Warehouse</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Products</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${transferRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }, [warehouses, products, dateRange]);

  const handleExportPDF = useCallback(async () => {
    setShowExportModal(false);
    setExporting(true);
    setExportProgress(0);

    try {
      const transfersToExport = filteredTransfers;
      const pdfContent = generatePDFContent(transfersToExport);
      
      setExportProgress(30);
      
      // Create temporary HTML file
      // const tempHtmlPath = `${RNFS.TemporaryDirectoryPath}/transfer_report.html`;
      // await RNFS.writeFile(tempHtmlPath, pdfContent, 'utf8');
      
      setExportProgress(60);
      
      // Convert HTML to PDF (you'll need to implement this based on your PDF library)
      // For now, we'll create a text file as placeholder
      // const pdfPath = `${RNFS.DocumentDirectoryPath}/transfer_report_${Date.now()}.txt`;
      // await RNFS.writeFile(pdfPath, pdfContent, 'utf8');
      
      setExportProgress(90);
      
      // For now, just show the content in an alert since file operations are disabled
      Alert.alert('Export Preview', `PDF content generated for ${transfersToExport.length} transfers. File operations temporarily disabled.`);
      
      setExportProgress(100);
      Alert.alert('Success', `PDF content generated successfully with ${transfersToExport.length} transfers`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  }, [filteredTransfers, generatePDFContent]);

  const handleExportCSV = useCallback(async () => {
    setShowExportModal(false);
    setExporting(true);
    setExportProgress(0);

    try {
      const transfersToExport = filteredTransfers;
      const csvContent = generateCSV(transfersToExport);
      
      setExportProgress(50);
      
      // Save CSV file
      // const csvPath = `${RNFS.DocumentDirectoryPath}/transfer_report_${Date.now()}.csv`;
      // await RNFS.writeFile(csvPath, csvContent, 'utf8');
      
      setExportProgress(80);
      
      // For now, just show the content in an alert since file operations are disabled
      Alert.alert('Export Preview', `CSV content generated for ${transfersToExport.length} transfers. File operations temporarily disabled.`);
      
      setExportProgress(100);
      Alert.alert('Success', `CSV content generated successfully with ${transfersToExport.length} transfers`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  }, [filteredTransfers, generateCSV]);

  // Action handlers
  const handleCreateTransfer = useCallback(() => {
    setEditingTransfer(null);
    setShowTransferForm(true);
  }, []);

  const handleEditTransfer = useCallback(() => {
    if (selectedTransfer) {
      setEditingTransfer(selectedTransfer);
      setShowTransferForm(true);
    } else {
      Alert.alert('Edit Transfer', 'Please select a transfer to edit');
    }
  }, [selectedTransfer]);

  const handleTransferFormSuccess = useCallback(() => {
    loadTransfers();
    setShowTransferForm(false);
  }, []);

  const handleExportTransfers = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleFilterTransfers = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setShowFilterModal(false);
    const activeFilters: string[] = [];
    
    if (filterStatus !== 'all') activeFilters.push(`Status: ${filterStatus}`);
    if (selectedWarehouse !== 'all') activeFilters.push(`Warehouse: ${getWarehouseName(selectedWarehouse)}`);
    if (dateRange.start && dateRange.end) activeFilters.push(`Date Range: ${dateRange.start} to ${dateRange.end}`);
    
    if (activeFilters.length > 0) {
      Alert.alert('Filters Applied', `Active filters: ${activeFilters.join(', ')}\n\nFound ${filteredTransfers.length} transfers`);
    } else {
      Alert.alert('Filters Applied', `Showing all ${filteredTransfers.length} transfers`);
    }
  }, [filterStatus, selectedWarehouse, dateRange, filteredTransfers.length, warehouses]);

  const handleClearFilters = useCallback(() => {
    setFilterStatus('all');
    setSelectedWarehouse('all');
    setDateRange({ start: '', end: '' });
    setShowFilterModal(false);
    Alert.alert('Filters Cleared', 'All filters have been reset');
  }, []);

  // Get active filter count for UI indication
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (selectedWarehouse !== 'all') count++;
    if (dateRange.start || dateRange.end) count++;
    return count;
  }, [filterStatus, selectedWarehouse, dateRange]);

  // Render functions
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Transfer History</Text>
      <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
        <Icon name="search" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <Animated.View style={[styles.searchContainer, { opacity: searchAnimation }]}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search transfers..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor={COLORS.text.secondary}
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchButton}>
          <Icon name="x" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

    const renderCard1 = () => (
    <View style={styles.card1}>
      <LinearGradient
        colors={getCurrentGradient()}
        style={styles.card1Gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.card1Content}>
          {selectedTransfer ? (
            <>
              <View style={styles.card1Header}>
                <TouchableOpacity onPress={handleBackToOverview} style={styles.backToOverviewButton}>
                  <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.warehouseRoute}>
                <Text style={styles.warehouseRouteText}>
                  {getWarehouseName(selectedTransfer.from_warehouse_id)} - {getWarehouseName(selectedTransfer.to_warehouse_id)}
                </Text>
              </View>
              
              <View style={styles.mainMetric}>
                <Text style={styles.mainMetricValue}>{getTransferTotal(selectedTransfer)}</Text>
                <Text style={styles.mainMetricLabel}>units transferred</Text>
                <Text style={styles.productName}>{getProductName(selectedTransfer.items[0]?.product_id)}</Text>
              </View>

              <View style={styles.chartContainer}>
                <BarChart
                  data={[
                    { value: Math.floor(Math.random() * 20) + 10, label: '' },
                    { value: Math.floor(Math.random() * 20) + 10, label: '' },
                    { value: Math.floor(Math.random() * 20) + 10, label: '' },
                    { value: Math.floor(Math.random() * 20) + 10, label: '' },
                  ]}
                  width={responsiveSpacing.chartWidth}
                  height={responsiveSpacing.chartHeight}
                  hideAxesAndRules
                  showVerticalLines={false}
                  disableScroll
                  hideOrigin
                  barWidth={20}
                  spacing={10}
                  initialSpacing={10}
                  endSpacing={10}
                  barBorderRadius={4}
                  frontColor="#FFFFFF"
                  gradientColor="#FFFFFF"
                />
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(selectedTransfer.created_at)}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.card1Header}>
                <Text style={styles.card1Title}>Total Transfers Overview</Text>
              </View>
              
              <View style={styles.mainMetric}>
                <Text style={styles.mainMetricValue}>{transfers.length}</Text>
                <Text style={styles.mainMetricLabel}>units transferred</Text>
                <Text style={styles.productName}>Total Transfers</Text>
              </View>
              
              <View style={styles.chartContainer}>
                <BarChart
                  data={[
                    { value: transfers.filter(t => t.status === 'pending').length, label: '' },
                    { value: transfers.filter(t => t.status === 'in_transit').length, label: '' },
                    { value: transfers.filter(t => t.status === 'completed').length, label: '' },
                    { value: transfers.filter(t => t.status === 'cancelled').length, label: '' },
                  ]}
                  width={responsiveSpacing.chartWidth}
                  height={responsiveSpacing.chartHeight}
                  hideAxesAndRules
                  showVerticalLines={false}
                  disableScroll
                  hideOrigin
                  barWidth={30}
                  spacing={20}
                  initialSpacing={20}
                  endSpacing={20}
                  barBorderRadius={6}
                  frontColor="#FFFFFF"
                  gradientColor="#FFFFFF"
                />
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
            </>
          )}
        </View>

        {/* SVG Decorations */}
        <Svg style={styles.svgDecorations} width="100%" height="100%">
          <Circle cx="50" cy="50" r="20" fill="rgba(255,255,255,0.1)" />
          <Circle cx="300" cy="80" r="15" fill="rgba(255,255,255,0.08)" />
          <Polygon points="250,120 260,100 270,120" fill="rgba(255,255,255,0.1)" />
        </Svg>
      </LinearGradient>
    </View>
  );

  const renderCard2 = () => (
    <View style={styles.card2}>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCreateTransfer}>
          <LinearGradient
            colors={[getCurrentGradient()[0], getCurrentGradient()[1]]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonText}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleEditTransfer}>
          <LinearGradient
            colors={[getCurrentGradient()[1], getCurrentGradient()[2]]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="edit" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleExportTransfers}>
          <LinearGradient
            colors={[getCurrentGradient()[2], getCurrentGradient()[3]]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="download" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleFilterTransfers}>
          <LinearGradient
            colors={[getCurrentGradient()[3], getCurrentGradient()[0]]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="filter" size={20} color="#FFFFFF" />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </LinearGradient>
          <Text style={styles.actionButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCard3 = () => (
    <>
      <View style={styles.card3Header}>
        <View style={styles.card3TitleContainer}>
          <Icon name="clock" size={24} color={COLORS.primary} />
          <Text style={styles.card3Title}>Transfer History</Text>
        </View>
        <Text style={styles.transferCount}>{filteredTransfers.length} transfers</Text>
      </View>

      {loading ? (
        <LoadingSkeleton />
      ) : filteredTransfers.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="inbox" size={48} color={COLORS.text.secondary} />
          <Text style={styles.emptyStateText}>No transfers found</Text>
          <Text style={styles.emptyStateSubtext}>
            {searchText ? 'Try adjusting your search' : 'Create your first transfer to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransfers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransferCard
              transfer={item}
              onPress={handleTransferPress}
              getWarehouseName={getWarehouseName}
              getProductName={getProductName}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              getTransferTotal={getTransferTotal}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transfersList}
        />
      )}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderHeader()}
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {renderHeader()}
      {showSearch && renderSearchBar()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCard1()}
        {renderCard2()}
        {renderCard3()}
      </ScrollView>

      {/* Modals */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        dateRange={dateRange}
        setDateRange={setDateRange}
        warehouses={warehouses}
        getWarehouseName={getWarehouseName}
        filteredTransfersCount={filteredTransfers.length}
        getActiveFilterCount={getActiveFilterCount}
      />

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        exporting={exporting}
        exportProgress={exportProgress}
        filteredTransfersCount={filteredTransfers.length}
        hasFilters={getActiveFilterCount() > 0}
      />

      <TransferForm
        visible={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        onSuccess={handleTransferFormSuccess}
        editingTransfer={editingTransfer}
        warehouses={warehouses}
        products={products}
      />
      {console.log('TransferForm props - products count:', products?.length || 0)}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Fixed Header Section with camera margin
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? (isTablet ? 80 : 60) : (isTablet ? 60 : 40), // Responsive camera margin
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? TYPOGRAPHY.sizes.xl : TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Card 1: Details Card Styles (Financial App Style)
  card1: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
    marginBottom: SPACING.lg, // Add proper spacing between cards
  },
  card1Gradient: {
    padding: isTablet ? SPACING.xl : SPACING.lg,
    position: 'relative',
  },
  card1Content: {
    zIndex: 2, // Ensure content is above decorations
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md, // Reduced padding
  },
  mainMetric: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  mainMetricValue: {
    fontSize: isTablet ? 56 : 44, // Increased font size
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mainMetricLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card1Header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 3,
  },
  card1Title: {
    fontSize: isTablet ? TYPOGRAPHY.sizes.xxl : TYPOGRAPHY.sizes.xl, // Increased font size
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  backToOverviewButton: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferDetails: {
    // Remove glass card effect - use solid gradient background
  },
  warehouseRoute: {
    marginBottom: SPACING.sm,
  },
  warehouseRouteText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  transferStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    paddingHorizontal: SPACING.xl, // Increased padding to center more
  },
  chartDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  productsList: {
    marginTop: SPACING.lg,
  },
  productsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  productItem: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
 
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  overviewStatLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  overviewChart: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    paddingHorizontal: SPACING.lg,
  },
  
  // SVG Decorations
  svgDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  // Card 2: Action Buttons Styles (Reduced Height)
  card2: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: isTablet ? SPACING.lg : SPACING.md, // Responsive padding
    ...SHADOWS.md,
    marginBottom: SPACING.lg, // Proper spacing
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: isTablet ? 56 : 48, // Responsive size
    height: isTablet ? 56 : 48, // Responsive size
    borderRadius: isTablet ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs, // Reduced margin
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtonText: {
    fontSize: isTablet ? TYPOGRAPHY.sizes.md : TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  
  // Card 3: Transactions Header (No Outer Div)
  card3Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
  },
  card3TitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm, // Add space between icon and title
  },
  card3Title: {
    fontSize: isTablet ? TYPOGRAPHY.sizes.xl : TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  transferCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  
  // Scrollable Transactions List
  transfersList: {
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg, // Add outer space around transfer cards
  },
  
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: isTablet ? SPACING.xl : SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  transactionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCardLeft: {
    marginRight: SPACING.md,
  },
  transactionIcon: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionCardCenter: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: isTablet ? TYPOGRAPHY.sizes.lg : TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  transactionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  transactionCardRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: isTablet ? TYPOGRAPHY.sizes.xl : TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  transactionAmountLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  
  // Search Bar Styles
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  clearSearchButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    marginTop: SPACING.sm,
    fontSize: isTablet ? TYPOGRAPHY.sizes.lg : TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  activeFilterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    marginRight: SPACING.md,
  },
  modalButtonSecondaryText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },

  // Filter Modal Styles
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  dropdownContainer: {
    marginTop: SPACING.sm,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF3C7',
  },
  dropdownButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  dropdownButtonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateInputActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF3C7',
  },
  dateInputText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  dateInputTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dateRangeSeparator: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },

  // Filter Summary Styles
  filterSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterSummaryTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  filterSummaryItems: {
    gap: SPACING.xs,
  },
  filterSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  filterSummaryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },



  // Export Modal Styles
  exportDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  exportFilterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  exportFilterNoticeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#92400E',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  exportProgressContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exportProgressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exportOptionDisabled: {
    opacity: 0.5,
  },
  exportOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  exportOptionContent: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  exportOptionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },

  // Warehouse Picker Styles
  warehouseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  warehouseOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  warehouseOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  warehouseOptionContent: {
    flex: 1,
  },
  warehouseOptionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  warehouseOptionTitleActive: {
    color: '#FFFFFF',
  },
  warehouseOptionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default AllTransfersScreen;
