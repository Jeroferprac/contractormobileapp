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

export interface Sale {
  id: string;
  customer_id?: string;
  warehouse_id: string;
  sale_date: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  status: SaleStatus;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
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
  average_order_value: number;
  top_selling_products: Product[];
  monthly_trends: MonthlyTrend[];
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

export interface UpdateStockRequest extends Partial<CreateStockRequest> {}

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

export interface CreateSaleRequest {
  customer_id?: string;
  warehouse_id: string;
  sale_date: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  tax_amount?: number;
  discount_amount?: number;
  notes?: string;
}

export interface StockAdjustmentRequest {
  product_id: string;
  warehouse_id: string;
  adjustment_type: AdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
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
