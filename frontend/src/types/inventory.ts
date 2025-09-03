// ===== INVENTORY TYPES =====

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category_name: string;
  brand?: string;
  unit: string;
  current_stock: number | string;
  min_stock_level: number | string;
  reorder_point: number | string;
  max_stock_level: number | string;
  cost_price: number | string;
  selling_price: number | string;
  description: string;
  weight: string;
  dimensions: string;
  is_active: boolean;
  track_serial: boolean;
  track_batch: boolean;
  is_composite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WarehouseCreate {
  name: string;
  code: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active?: boolean;
}

export interface WarehouseUpdate extends Partial<WarehouseCreate> {}

export interface WarehouseOut extends Warehouse {}

export interface WarehouseStats {
  total_bins: number;
  active_bins: number;
  total_stock: number;
  utilization_percentage: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_value: number;
}

export interface Stock {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number | string;
  reserved_quantity: number | string;
  available_quantity: number | string;
  bin_location?: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  product_id: string;
  transaction_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type: string;
  reference_id: string;
  notes?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_number?: string;
  payment_terms?: string;
  credit_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSupplier {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_code?: string;
  cost_price?: number;
  lead_time_days: number;
  minimum_order_quantity?: number;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
  // API field names (from backend)
  supplier_price?: number | null;
  min_order_qty?: number | null;
  product?: Product;
  supplier?: Supplier;
}

export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';

export interface Transfer {
  id: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  status: TransferStatus;
  notes?: string;
  created_by: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  from_warehouse?: Warehouse;
  to_warehouse?: Warehouse;
  items: TransferItem[];
}

export interface TransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export type SaleStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

// ===== CUSTOMER TYPES =====

export interface Customer {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  tax_id: string;
  payment_terms: number;
  credit_limit: string;
  price_list_id: string;
  is_active: boolean;
  created_at: string;
}

// ===== SALE TYPES =====

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total_price: number;
  product?: Product;
}

export interface Sale {
  id: string;
  sale_number: string;
  customer_id: string;
  sale_date: string;
  due_date: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  paid_amount: string;
  status: string;
  payment_status: string;
  shipping_address: string;
  created_by: string;
  shipped_at?: string;
  customer?: Customer;
  customer_name: string;
  overdue_days: number;
  items?: SaleItem[];
  notes?: string;
  warehouse_id?: string;
}

export interface SaleDetails extends Sale {
  customer?: Customer;
  items?: SaleItem[];
  warehouse?: Warehouse;
}


export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';


export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  warehouse_id?: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount?: number;
  status: PurchaseOrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  warehouse?: Warehouse;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  product_count: number;
}

export type ChartDataPoint = {
  label: string;
  value: number;
  dataPointText: string;
};

// Inventory summary structure
export interface InventorySummary {
  total_products: number;
  total_warehouses: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_inventory_value: number;
  recent_transactions: number;
  chartData?: ChartDataPoint[]; 
}

export interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  latest_sale?: string;
}

export interface GroupedSalesSummary {
  label: string;
  total_sales: number;
  total_revenue: number;
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  total_sales: number;
  percentage_of_total_sales: number;
}

export interface MonthlySalesSummary {
  year: number;
  month: number;
  total_sales: number;
  total_revenue: number;
}

export interface MonthlyTrend {
  month: string; // e.g. "2025-07"
  sales: number;
  revenue: number;
}

export type AdjustmentType = 'add' | 'subtract' | 'set';

export interface StockAdjustment {
  id: string;
  product_id: string;
  warehouse_id: string;
  adjustment_type: AdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
  created_by: string;
  created_at: string;
  product?: Product;
  warehouse?: Warehouse;
}

// ===== SALE REQUEST TYPES =====

export interface CreateSaleRequest {
  sale_number: string; // Required field
  customer_id: string;
  warehouse_id: string;
  price_list_id?: string;
  sale_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  payment_status: 'unpaid' | 'partial' | 'paid'; // Fixed enum values
  shipping_address: string;
  notes?: string;
  created_by: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
    total_price: number;
  }[];
}

export interface UpdateSaleRequest {
  sale_number?: string;
  sale_date?: string;
  total_amount?: number;
  status?: string;
  notes?: string;
  customer_id?: string;
  warehouse_id?: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  paid_amount?: number;
  due_date?: string;
  shipping_address?: string;
  created_by?: string;
  items?: {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
    total_price: number;
  }[];
}

// ===== SALE FILTER TYPES =====

export interface SaleFilters {
  customer_id?: string;
  warehouse_id?: string;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OverdueSaleFilters {
  customer_id?: string;
  warehouse_id?: string;
  from_date?: string;
  to_date?: string;
}

// ===== INVOICE TYPES =====

export interface Invoice {
  sale_id: string;
  sale_number: string;
  invoice_number: string;
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  sale_date: string;
  due_date: string;
  status: string;
  payment_status: string;
  shipping_address: string;
  notes?: string;
  created_at: string;
}

// ===== API REQUEST TYPES =====

export interface CreateProductRequest extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateStockRequest {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity?: number;
  available_quantity?: number;
  bin_location?: string;
}

export interface UpdateStockRequest {
  product_id?: string;
  warehouse_id?: string;
  quantity?: number;
  reserved_quantity?: number;
  available_quantity?: number;
  bin_location?: string;
}

export interface CreateTransferRequest {
  transfer_number?: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  transfer_date?: string;
  status?: TransferStatus;
  notes?: string;
  created_by?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface StockAdjustmentRequest {
  product_id: string;
  warehouse_id: string;
  adjustment_type: AdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
}

// ===== BARCODE TYPES =====

export interface BarcodeGenerateRequest {
  product_id: string;
  barcode_type?: string;
}

export interface BarcodeScanRequest {
  barcode: string;
  warehouse_id?: string;
}

// ===== PROFIT/LOSS TYPES =====

export interface ProfitLossAnalysis {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  gross_profit_margin: number;
  net_profit: number;
  net_profit_margin: number;
  period: {
    start_date: string;
    end_date: string;
  };
  breakdown: {
    sales: number;
    purchases: number;
    expenses: number;
    adjustments: number;
  };
}

export interface CustomerProfitLoss {
  customer_id: string;
  customer_name: string;
  total_sales: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  gross_profit_margin: number;
  order_count: number;
  average_order_value: number;
}

export interface ProductProfitLoss {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  gross_profit_margin: number;
  average_selling_price: number;
  average_cost_price: number;
}

// ===== API RESPONSE TYPES =====

export interface InventoryResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SalesResponse extends Array<Sale> {
  // Backend returns array directly, not wrapped in data object
}

export interface SaleResponse extends SaleDetails {
  // Backend returns SaleOut directly, not wrapped in data object
}

export interface InvoiceResponse {
  data: Invoice;
  message: string;
  status: number;
}

export interface OverdueSalesResponse {
  data: Sale[];
  total: number;
  message: string;
  status: number;
}
