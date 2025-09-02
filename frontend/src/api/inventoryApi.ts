import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Product,
  Warehouse,
  Stock,
  Supplier,
  ProductSupplier,
  Transfer,
  Sale,
  SaleDetails,
  SaleItem,
  Customer,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleFilters,
  OverdueSaleFilters,
  Invoice,
  SalesResponse,
  SaleResponse,
  InvoiceResponse,
  OverdueSalesResponse,
  PurchaseOrder,
  Category,
  InventorySummary,
  SalesSummary,
  GroupedSalesSummary,
  TopCustomer,
  MonthlySalesSummary,
  StockAdjustment,
  Transaction,
  CreateProductRequest,
  UpdateProductRequest,
  CreateStockRequest,
  UpdateStockRequest,
  CreateTransferRequest,
  StockAdjustmentRequest,
  InventoryResponse,
  PaginatedResponse
} from '../types/inventory';
import { getBaseURL } from '../utils/network';
import { API_CONFIG } from '../config/env';
import storageService from '../utils/storage';

class InventoryApiService {
  private api: AxiosInstance;
  private basePath: string = '/inventory/inventory';

  constructor() {
    this.api = axios.create({
      baseURL: getBaseURL(),
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth tokens
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          await this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await storageService.getAuthToken();
    } catch (error) {
      return null;
    }
  }

  private async clearAuthToken(): Promise<void> {
    await storageService.clearAuthData();
  }

  // ===== PRODUCTS ENDPOINTS =====

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category_name?: string;
    brand?: string;
    warehouse?: string;
    search?: string;
    sort?: string;
  }): Promise<AxiosResponse<Product[]>> {
    return this.api.get(`${this.basePath}/products`, { params });
  }

  async createProduct(productData: CreateProductRequest): Promise<AxiosResponse<Product>> {
    return this.api.post(`${this.basePath}/products`, productData);
  }

  async getProductById(id: string): Promise<AxiosResponse<Product>> {
    return this.api.get(`${this.basePath}/products/${id}`);
  }

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<AxiosResponse<Product>> {
    return this.api.put(`${this.basePath}/products/${id}`, productData);
  }

  async deleteProduct(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`${this.basePath}/products/${id}`);
  }

  async getLowStockProducts(): Promise<AxiosResponse<Product[]>> {
    return this.api.get(`${this.basePath}/products/low-stock`);
  }

  async getProductByBarcode(barcode: string): Promise<AxiosResponse<Product>> {
    return this.api.get(`${this.basePath}/products/barcode/${barcode}`);
  }

  async bulkUpdateProducts(products: UpdateProductRequest[]): Promise<AxiosResponse<Product[]>> {
    return this.api.post(`${this.basePath}/products/bulk-update`, { products });
  }

  async getCategories(): Promise<AxiosResponse<Category[]>> {
    return this.api.get(`${this.basePath}/products/categories`);
  }

  async getProductStock(id: string): Promise<AxiosResponse<Stock[]>> {
    return this.api.get(`${this.basePath}/products/${id}/stock`);
  }

  // ===== CUSTOMERS ENDPOINTS =====

  async getCustomers(): Promise<AxiosResponse<Customer[]>> {
    return this.api.get('/customers/');
  }

  async getCustomerById(id: string): Promise<AxiosResponse<Customer>> {
    return this.api.get(`/customers/${id}`);
  }

  async createCustomer(customerData: Partial<Customer>): Promise<AxiosResponse<Customer>> {
    return this.api.post('/customers', customerData);
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<AxiosResponse<Customer>> {
    return this.api.put(`/customers/${id}`, customerData);
  }

  async deleteCustomer(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/customers/${id}`);
  }

  // ===== WAREHOUSES ENDPOINTS =====

  async getWarehouses(): Promise<AxiosResponse<Warehouse[]>> {
    return this.api.get(`${this.basePath}/warehouses`);
  }

  async createWarehouse(warehouseData: Partial<Warehouse>): Promise<AxiosResponse<Warehouse>> {
    return this.api.post(`${this.basePath}/warehouses`, warehouseData);
  }

  async getWarehouseById(id: string): Promise<AxiosResponse<Warehouse>> {
    return this.api.get(`${this.basePath}/warehouses/${id}`);
  }

  async updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<AxiosResponse<Warehouse>> {
    return this.api.put(`${this.basePath}/warehouses/${id}`, warehouseData);
  }

  async deleteWarehouse(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`${this.basePath}/warehouses/${id}`);
  }

  // ===== STOCK ENDPOINTS =====

  async getWarehouseStocks(params?: {
    warehouse_id?: string;
    product_id?: string;
    low_stock?: boolean;
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }): Promise<AxiosResponse<Stock[]>> {
    return this.api.get(`${this.basePath}/warehouse-stocks`, { params });
  }

  async createStock(stockData: CreateStockRequest): Promise<AxiosResponse<Stock>> {
    return this.api.post(`${this.basePath}/warehouse-stocks`, stockData);
  }

  async getStockById(stockId: string): Promise<AxiosResponse<Stock>> {
    return this.api.get(`${this.basePath}/warehouse-stocks/${stockId}`);
  }

  async updateStock(stockId: string, stockData: UpdateStockRequest): Promise<AxiosResponse<Stock>> {
    return this.api.put(`${this.basePath}/warehouse-stocks/${stockId}`, stockData);
  }

  async deleteStock(stockId: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`${this.basePath}/warehouse-stocks/${stockId}`);
  }

  async getStockByProduct(productId: string): Promise<AxiosResponse<Stock>> {
    return this.api.get(`${this.basePath}/stock/product/${productId}`);
  }

  async addStock(stockData: {
    product_id: string;
    warehouse_id: string;
    quantity: number;
    bin_location?: string;
  }): Promise<AxiosResponse<Stock>> {
    return this.api.post(`${this.basePath}/stock`, stockData);
  }

  // ===== TRANSACTIONS ENDPOINTS =====

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    product_id?: string;
    warehouse_id?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
  }): Promise<AxiosResponse<Transaction[]>> {
    return this.api.get(`${this.basePath}/transactions`, { params });
  }

  // ===== TRANSFERS ENDPOINTS =====

  async getTransfers(): Promise<AxiosResponse<Transfer[]>> {
    return this.api.get(`${this.basePath}/warehouses/transfers`);
  }

  async createTransfer(transferData: CreateTransferRequest): Promise<AxiosResponse<Transfer>> {
    return this.api.post(`${this.basePath}/warehouses/transfer`, transferData);
  }

  async getTransferById(id: string): Promise<AxiosResponse<Transfer>> {
    return this.api.get(`${this.basePath}/warehouses/transfers/${id}`);
  }

  async updateTransfer(id: string, transferData: Partial<CreateTransferRequest>): Promise<AxiosResponse<Transfer>> {
    return this.api.put(`${this.basePath}/warehouses/transfers/${id}`, transferData);
  }

  async completeTransfer(id: string): Promise<AxiosResponse<Transfer>> {
    return this.api.post(`${this.basePath}/warehouses/transfers/${id}/complete`);
  }

  async getTransferStatusOptions(): Promise<AxiosResponse<string[]>> {
    return this.api.get(`${this.basePath}/warehouses/transfer-status-options`);
  }

  // ===== SUPPLIERS ENDPOINTS =====

  async getSuppliers(): Promise<AxiosResponse<Supplier[]>> {
    return this.api.get(`${this.basePath}/suppliers`);
  }

  async createSupplier(supplierData: Partial<Supplier>): Promise<AxiosResponse<Supplier>> {
    return this.api.post(`${this.basePath}/suppliers`, supplierData);
  }

  async getSupplierById(id: string): Promise<AxiosResponse<Supplier>> {
    return this.api.get(`${this.basePath}/suppliers/${id}`);
  }

  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<AxiosResponse<Supplier>> {
    return this.api.put(`${this.basePath}/suppliers/${id}`, supplierData);
  }

  async deleteSupplier(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`${this.basePath}/suppliers/${id}`);
  }

  // ===== PRODUCT SUPPLIERS ENDPOINTS =====

  async getProductSuppliers(): Promise<AxiosResponse<ProductSupplier[]>> {
    return this.api.get(`${this.basePath}/product-suppliers`);
  }

  async createProductSupplier(productSupplierData: Partial<ProductSupplier>): Promise<AxiosResponse<ProductSupplier>> {
    return this.api.post(`${this.basePath}/product-suppliers`, productSupplierData);
  }

  async getProductSupplierById(id: string): Promise<AxiosResponse<ProductSupplier>> {
    return this.api.get(`${this.basePath}/product-suppliers/${id}`);
  }

  async updateProductSupplier(id: string, productSupplierData: Partial<ProductSupplier>): Promise<AxiosResponse<ProductSupplier>> {
    return this.api.put(`${this.basePath}/product-suppliers/${id}`, productSupplierData);
  }

  async deleteProductSupplier(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`${this.basePath}/product-suppliers/${id}`);
  }

  // ===== SALES ENDPOINTS =====

  async getSales(params?: SaleFilters): Promise<AxiosResponse<SalesResponse>> {
    return this.api.get(`${this.basePath}/sales`, { params });
  }

  async getSaleById(id: string): Promise<AxiosResponse<SaleResponse>> {
    return this.api.get(`${this.basePath}/sales/${id}`);
  }

  async createSale(saleData: CreateSaleRequest): Promise<AxiosResponse<SaleResponse>> {
    return this.api.post(`${this.basePath}/sales`, saleData);
  }

  async updateSale(id: string, saleData: UpdateSaleRequest): Promise<AxiosResponse<SaleResponse>> {
    return this.api.put(`${this.basePath}/sales/${id}`, saleData);
  }

  async getSalesSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AxiosResponse<SalesSummary>> {
    return this.api.get(`${this.basePath}/sales/summary`, { params });
  }

  async getSalesSummaryGrouped(params?: {
    group_by?: 'daily' | 'weekly' | 'monthly';
    start_date?: string;
    end_date?: string;
  }): Promise<AxiosResponse<GroupedSalesSummary[]>> {
    return this.api.get(`${this.basePath}/sales/summary/grouped`, { params });
  }

  async getMonthlySalesSummary(params?: {
    year?: number;
  }): Promise<AxiosResponse<MonthlySalesSummary[]>> {
    return this.api.get(`${this.basePath}/sales/summary/monthly`, { params });
  }

  async getTopCustomers(params?: {
    start_date?: string;
    end_date?: string;
    warehouse_id?: string;
  }): Promise<AxiosResponse<TopCustomer[]>> {
    return this.api.get(`${this.basePath}/sales/summary/top-customers`, { params });
  }

  async getOverdueSales(params?: OverdueSaleFilters): Promise<AxiosResponse<OverdueSalesResponse>> {
    return this.api.get(`${this.basePath}/sales/overdue`, { params });
  }

  async confirmSale(id: string): Promise<AxiosResponse<SaleResponse>> {
    return this.api.post(`${this.basePath}/sales/${id}/confirm`);
  }

  async shipSale(id: string): Promise<AxiosResponse<SaleResponse>> {
    return this.api.post(`${this.basePath}/sales/${id}/ship`);
  }

  async getSaleInvoice(id: string): Promise<AxiosResponse<InvoiceResponse>> {
    return this.api.get(`${this.basePath}/sales/${id}/invoice`);
  }

  // ===== PURCHASE ORDERS ENDPOINTS =====

  async getPurchaseOrders(): Promise<AxiosResponse<PurchaseOrder[]>> {
    return this.api.get(`${this.basePath}/purchase-orders`);
  }

  async createPurchaseOrder(purchaseOrderData: Partial<PurchaseOrder>): Promise<AxiosResponse<PurchaseOrder>> {
    return this.api.post(`${this.basePath}/purchase-orders`, purchaseOrderData);
  }

  async getPurchaseOrderById(id: string): Promise<AxiosResponse<PurchaseOrder>> {
    return this.api.get(`${this.basePath}/purchase-orders/${id}`);
  }

  async updatePurchaseOrder(id: string, purchaseOrderData: Partial<PurchaseOrder>): Promise<AxiosResponse<PurchaseOrder>> {
    return this.api.put(`${this.basePath}/purchase-orders/${id}`, purchaseOrderData);
  }

  // ===== INVENTORY MANAGEMENT ENDPOINTS =====

  async getCurrentStockLevels(): Promise<AxiosResponse<Stock[]>> {
    return this.api.get(`${this.basePath}/warehouse-stocks`);
  }

  async getStocks(params?: {
    warehouse_id?: string;
    low_stock?: boolean;
    product_id?: string;
  }): Promise<AxiosResponse<Stock[]>> {
    return this.api.get(`${this.basePath}/warehouse-stocks`, { params });
  }

  async getWarehouseStock(warehouseId: string): Promise<AxiosResponse<Stock[]>> {
    return this.api.get(`${this.basePath}/warehouses/${warehouseId}/stocks`);
  }

  async getWarehouseStats(warehouseId: string): Promise<AxiosResponse<any>> {
    return this.api.get(`${this.basePath}/warehouses/${warehouseId}/stats`);
  }

  async getLowStockItems(params?: {
    warehouse_id?: string;
    product_id?: string;
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }): Promise<AxiosResponse<Stock[]>> {
    return this.api.get(`${this.basePath}/warehouse-stocks`, { 
      params: { ...params, low_stock: true } 
    });
  }

  async adjustStockLevel(adjustmentData: StockAdjustmentRequest): Promise<AxiosResponse<StockAdjustment>> {
    return this.api.post(`${this.basePath}/adjust`, adjustmentData);
  }

  async getInventoryReport(): Promise<AxiosResponse<InventorySummary>> {
    return this.api.get(`${this.basePath}/reports`);
  }
  
   async getSummary(): Promise<AxiosResponse<InventorySummary>> {
    return this.getInventoryReport();
  }
  // ===== ANALYTICS ENDPOINTS =====

  async getSalesByCustomer(): Promise<AxiosResponse<any>> {
    return this.api.get(`${this.basePath}/sales/summary/by-customer`);
  }

  async getSalesByProduct(): Promise<AxiosResponse<any>> {
    return this.api.get(`${this.basePath}/sales/summary/by-product`);
  }

  async getPurchaseBySupplier(): Promise<AxiosResponse<any>> {
    return this.api.get(`${this.basePath}/purchase/summary/by-supplier`);
  }

  async getPurchaseByProduct(): Promise<AxiosResponse<any>> {
    return this.api.get(`${this.basePath}/purchase/summary/by-product`);
  }

  async getSalesByPeriod(dateFrom: string, dateTo: string): Promise<AxiosResponse<any>> {
    return this.api.get(`${this.basePath}/sales/details/by-period`, {
      params: { date_from: dateFrom, date_to: dateTo }
    });
  }

  async getAllSales(params?: SaleFilters): Promise<AxiosResponse<SalesResponse>> {
    return this.api.get(`${this.basePath}/sales/all`, { params });
  }

  async getSaleDetails(id: string): Promise<AxiosResponse<SaleDetails>> {
    return this.api.get(`${this.basePath}/sales/${id}/details`);
  }

  async getSaleItems(id: string): Promise<AxiosResponse<SaleItem[]>> {
    return this.api.get(`${this.basePath}/sales/${id}/items`);
  }

  async getSaleInvoiceById(id: string): Promise<AxiosResponse<InvoiceResponse>> {
    return this.api.get(`${this.basePath}/sales/${id}/invoice`);
  }

  async getOverdueSalesByCustomer(params?: OverdueSaleFilters): Promise<AxiosResponse<OverdueSalesResponse>> {
    return this.api.get(`${this.basePath}/sales/overdue/by-customer`, { params });
  }
}

export const inventoryApiService = new InventoryApiService();
export default inventoryApiService; 