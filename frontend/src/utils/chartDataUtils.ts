import { Warehouse, Stock, BarChartData } from '../types/inventory';

/**
 * Transform warehouse and stock data into BarChart format
 * @param warehouses Array of warehouse objects
 * @param stockLevels Array of stock level objects
 * @param maxItems Maximum number of items to show (default: 7)
 * @returns Array of BarChartData for the responsive chart
 */
export const transformWarehouseStockToChartData = (
  warehouses: Warehouse[],
  stockLevels: Stock[],
  maxItems: number = 7
): BarChartData[] => {
  // Create a map of warehouse ID to name
  const warehouseMap = new Map<string, string>();
  warehouses.forEach(warehouse => {
    warehouseMap.set(warehouse.id, warehouse.name);
  });
  
  // Group stock by warehouse
  const warehouseStocks: Record<string, number> = {};
  
  // Initialize with all warehouses at 0
  warehouses.forEach(warehouse => {
    warehouseStocks[warehouse.id] = 0;
  });
  
  // Sum up quantities for each warehouse
  stockLevels.forEach(stock => {
    if (stock.warehouse_id && warehouseStocks[stock.warehouse_id] !== undefined) {
      const quantity = typeof stock.quantity === 'string' ? parseFloat(stock.quantity || '0') : (stock.quantity || 0);
      warehouseStocks[stock.warehouse_id] += isNaN(quantity) ? 0 : quantity;
    }
  });
  
  // Convert to array format for chart
  const result = Object.entries(warehouseStocks).map(([warehouseId, quantity]) => {
    const warehouseName = warehouseMap.get(warehouseId) || 'Unknown';
    // Show first 3 letters in uppercase
    const shortName = warehouseName.substring(0, 3).toUpperCase();
    
    return {
      value: quantity,
      label: shortName,
      fullLabel: warehouseName, // Full name for tooltip
      colorStart: '#EDA071', // Default orange gradient start
      colorEnd: '#F5F5F7',   // Default orange gradient end
    };
  });
  
  // Sort by quantity (highest first) and limit to maxItems
  result.sort((a, b) => b.value - a.value);
  
  return result.slice(0, maxItems);
};

/**
 * Transform product sales data into BarChart format
 * @param products Array of product objects with sales data
 * @param maxItems Maximum number of items to show (default: 7)
 * @returns Array of BarChartData for the responsive chart
 */
export const transformProductSalesToChartData = (
  products: any[],
  maxItems: number = 7
): BarChartData[] => {
  return products.slice(0, maxItems).map((product, index) => ({
    value: product.sales_count || product.quantity || 0,
    label: product.name || `Product ${index + 1}`,
    colorStart: '#EDA071',
    colorEnd: '#F5F5F7',
  }));
};

/**
 * Generate sample data for different time periods
 * @param period 'day' | 'week' | 'month'
 * @param baseData Base data to work with
 * @returns Array of BarChartData for the specified period
 */
export const generateTimeBasedChartData = (
  period: 'day' | 'week' | 'month',
  baseData: BarChartData[]
): BarChartData[] => {
  switch (period) {
    case 'day':
      // For daily view, show last 7 days
      return Array.from({ length: 7 }, (_, i) => ({
        value: Math.floor(Math.random() * 100) + 10,
        label: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        colorStart: '#EDA071',
        colorEnd: '#F5F5F7',
      }));
    
    case 'week':
      // For weekly view, show last 4 weeks
      return Array.from({ length: 4 }, (_, i) => ({
        value: Math.floor(Math.random() * 200) + 50,
        label: `Week ${4 - i}`,
        colorStart: '#EDA071',
        colorEnd: '#F5F5F7',
      }));
    
    case 'month':
      // For monthly view, show last 6 months
      return Array.from({ length: 6 }, (_, i) => ({
        value: Math.floor(Math.random() * 500) + 100,
        label: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        colorStart: '#EDA071',
        colorEnd: '#F5F5F7',
      }));
    
    default:
      return baseData;
  }
};
