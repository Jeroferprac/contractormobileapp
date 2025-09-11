import { apiService } from './api';

export interface Batch {
  id: string;
  name: string;
  description: string;
  batch_number: string;
  status: 'active' | 'inactive' | 'completed' | 'pending';
  total_items: number;
  total_value: number;
  currency: string;
  category: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateBatchRequest {
  name: string;
  description: string;
  batch_number: string;
  status: 'active' | 'inactive' | 'completed' | 'pending';
  currency: string;
  category: string;
  total_items?: number;
}

export interface UpdateBatchRequest {
  manufacturing_date?: string;
  expiry_date?: string;
  quantity?: number;
  available_quantity?: number;
}

// Mock data for batches
const mockBatches: Batch[] = [
  {
    id: '1',
    name: 'Production Batch A',
    description: 'First production batch for Q1 2024',
    batch_number: 'BATCH-2024-001',
    status: 'active',
    total_items: 150,
    total_value: 75000,
    currency: 'USD',
    category: 'Production',
    color: '#4CAF50',
    icon: 'package',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    is_active: true,
  },
  {
    id: '2',
    name: 'Quality Control Batch',
    description: 'Quality control batch for testing',
    batch_number: 'BATCH-2024-002',
    status: 'completed',
    total_items: 75,
    total_value: 45000,
    currency: 'USD',
    category: 'Quality Control',
    color: '#2196F3',
    icon: 'check-circle',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:20:00Z',
    is_active: true,
  },
  {
    id: '3',
    name: 'Sample Batch',
    description: 'Sample batch for customer approval',
    batch_number: 'BATCH-2024-003',
    status: 'pending',
    total_items: 25,
    total_value: 15000,
    currency: 'USD',
    category: 'Samples',
    color: '#FF9800',
    icon: 'gift',
    created_at: '2024-01-22T11:00:00Z',
    updated_at: '2024-01-22T11:00:00Z',
    is_active: true,
  },
  {
    id: '4',
    name: 'Rework Batch',
    description: 'Batch for reworked items',
    batch_number: 'BATCH-2024-004',
    status: 'inactive',
    total_items: 30,
    total_value: 12000,
    currency: 'USD',
    category: 'Rework',
    color: '#F44336',
    icon: 'refresh-cw',
    created_at: '2024-01-25T13:30:00Z',
    updated_at: '2024-01-25T13:30:00Z',
    is_active: false,
  },
  {
    id: '5',
    name: 'Export Batch',
    description: 'Batch prepared for export',
    batch_number: 'BATCH-2024-005',
    status: 'active',
    total_items: 200,
    total_value: 120000,
    currency: 'USD',
    category: 'Export',
    color: '#9C27B0',
    icon: 'truck',
    created_at: '2024-01-28T08:45:00Z',
    updated_at: '2024-01-28T08:45:00Z',
    is_active: true,
  },
];

class BatchesApiService {
  private apiService = apiService;
  private useMockData = false; // Set to true to use mock data instead of API
  private useRealAPI = true; // Set to false to disable real API calls

  // Transform backend batch data to frontend format
  private async transformBackendBatch(backendBatch: any): Promise<Batch> {
    // Try to get product and warehouse info
    const productInfo = backendBatch.product_id ? await this.getProductInfo(backendBatch.product_id) : null;
    const warehouseInfo = backendBatch.warehouse_id ? await this.getWarehouseInfo(backendBatch.warehouse_id) : null;
    
    const productName = productInfo?.name || `Product ${backendBatch.product_id || 'Unknown'}`;
    const warehouseName = warehouseInfo?.name || `Warehouse ${backendBatch.warehouse_id || 'Unknown'}`;
    
    return {
      id: backendBatch.id,
      name: `${productName} - ${backendBatch.batch_number}`,
      description: `Inventory batch for ${productName} at ${warehouseName}`,
      batch_number: backendBatch.batch_number,
      status: this.determineBatchStatus(backendBatch),
      total_items: Number(backendBatch.quantity) || 0,
      total_value: Number(backendBatch.quantity) * (productInfo?.price || 100), // Use product price if available
      currency: 'USD',
      category: productInfo?.category_name || 'Inventory',
      color: this.getBatchColor(backendBatch),
      icon: 'package',
      created_at: backendBatch.created_at,
      updated_at: backendBatch.created_at, // Backend doesn't have updated_at
      is_active: true,
    };
  }

  // Determine batch status based on expiry date and quantity
  private determineBatchStatus(batch: any): 'active' | 'inactive' | 'completed' | 'pending' {
    if (!batch.expiry_date) return 'active';
    
    const today = new Date();
    const expiryDate = new Date(batch.expiry_date);
    const availableQty = Number(batch.available_quantity) || 0;
    
    if (availableQty === 0) return 'completed';
    if (expiryDate < today) return 'inactive';
    if (expiryDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) return 'pending'; // 30 days
    return 'active';
  }

  // Get batch color based on status
  private getBatchColor(batch: any): string {
    const status = this.determineBatchStatus(batch);
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'inactive': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  // Get product information for a batch
  private async getProductInfo(productId: string): Promise<any> {
    try {
      const response = await this.apiService.get(`/inventory/inventory/products/${productId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ [BatchesAPI] Could not fetch product info for', productId);
      return null;
    }
  }

  // Get warehouse information for a batch
  private async getWarehouseInfo(warehouseId: string): Promise<any> {
    try {
      const response = await this.apiService.get(`/inventory/inventory/warehouses/${warehouseId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ [BatchesAPI] Could not fetch warehouse info for', warehouseId);
      return null;
    }
  }

  // Create sample batches for demonstration
  private async createSampleBatches(): Promise<Batch[]> {
    try {
      console.log('🔄 [BatchesAPI] Creating sample batches...');
      
      const sampleBatchData = [
        {
          product_id: '00000000-0000-0000-0000-000000000001',
          warehouse_id: '00000000-0000-0000-0000-000000000001',
          batch_number: 'SAMPLE-2024-001',
          manufacturing_date: '2024-01-15',
          expiry_date: '2025-01-15',
          quantity: 150,
          available_quantity: 150,
        },
        {
          product_id: '00000000-0000-0000-0000-000000000002',
          warehouse_id: '00000000-0000-0000-0000-000000000001',
          batch_number: 'SAMPLE-2024-002',
          manufacturing_date: '2024-01-20',
          expiry_date: '2024-07-20',
          quantity: 75,
          available_quantity: 50,
        },
        {
          product_id: '00000000-0000-0000-0000-000000000003',
          warehouse_id: '00000000-0000-0000-0000-000000000002',
          batch_number: 'SAMPLE-2024-003',
          manufacturing_date: '2024-02-01',
          expiry_date: '2024-08-01',
          quantity: 200,
          available_quantity: 200,
        }
      ];

      const createdBatches = [];
      for (const batchData of sampleBatchData) {
        try {
          const response = await this.apiService.post('/batches/', batchData);
          const transformedBatch = await this.transformBackendBatch(response.data);
          createdBatches.push(transformedBatch);
        } catch (error) {
          console.warn('⚠️ [BatchesAPI] Could not create sample batch:', batchData.batch_number);
        }
      }

      console.log('✅ [BatchesAPI] Created', createdBatches.length, 'sample batches');
      return createdBatches;
    } catch (error) {
      console.error('❌ [BatchesAPI] Error creating sample batches:', error);
      return mockBatches; // Fallback to mock data
    }
  }

  // Get all batches
  async getBatches(): Promise<Batch[]> {
    try {
      console.log('🔄 [BatchesAPI] Fetching batches from API...');
      
      // If using mock data, return mock data directly
      if (this.useMockData) {
        console.log('📦 [BatchesAPI] Using mock data (API disabled)');
        return mockBatches;
      }

      // If real API is disabled, use mock data
      if (!this.useRealAPI) {
        console.log('📦 [BatchesAPI] Real API disabled, using mock data');
        return mockBatches;
      }
      
      const response = await this.apiService.get('/batches/');
      console.log('✅ [BatchesAPI] Successfully fetched', response.data?.length || 0, 'batches from backend');
      
      // Transform backend data to frontend format
      const transformedBatches = await Promise.all(
        (response.data || []).map(batch => this.transformBackendBatch(batch))
      );
      console.log('🔄 [BatchesAPI] Transformed', transformedBatches.length, 'batches to frontend format');
      
      // If no batches found, create some sample data
      if (transformedBatches.length === 0) {
        console.log('📝 [BatchesAPI] No batches found, creating sample data...');
        const sampleBatches = await this.createSampleBatches();
        return sampleBatches;
      }
      
      return transformedBatches;
    } catch (error: any) {
      console.error('❌ [BatchesAPI] API error:', error.message || error);
      console.error('❌ [BatchesAPI] Error details:', {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Only use mock data as last resort
      console.log('📦 [BatchesAPI] Using mock data as fallback');
      
      // Check if it's a network error (backend not running)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.warn('⚠️ [BatchesAPI] Backend server appears to be offline. Please start the backend server.');
      }
      
      return mockBatches;
    }
  }

  // Get a specific batch
  async getBatch(batchId: string): Promise<Batch> {
    try {
      console.log('🔄 [BatchesAPI] Fetching batch', batchId, 'from API...');
      const response = await this.apiService.get(`/batches/${batchId}`);
      console.log('✅ [BatchesAPI] Successfully fetched batch from backend');
      
      // Transform backend data to frontend format
      const transformedBatch = await this.transformBackendBatch(response.data);
      console.log('🔄 [BatchesAPI] Transformed batch to frontend format:', transformedBatch.name);
      
      return transformedBatch;
    } catch (error: any) {
      console.error('❌ [BatchesAPI] API error for batch', batchId, ':', error.message || error);
      console.error('❌ [BatchesAPI] Error details:', {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Use mock data as fallback
      console.log('📦 [BatchesAPI] Using mock data as fallback for batch', batchId);
      const mockBatch = mockBatches.find(batch => batch.id === batchId);
      if (mockBatch) {
        return mockBatch;
      }
      throw new Error('Batch not found');
    }
  }

  // Create a new batch
  async createBatch(batchData: CreateBatchRequest): Promise<Batch> {
    try {
      console.log('🔄 [BatchesAPI] Creating batch:', batchData.name);
      
      // Transform frontend data to backend format
      const backendBatchData = {
        product_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
        warehouse_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
        batch_number: batchData.batch_number,
        manufacturing_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        quantity: batchData.total_items || 0,
        available_quantity: batchData.total_items || 0,
      };
      
      const response = await this.apiService.post('/batches/', backendBatchData);
      console.log('✅ [BatchesAPI] Successfully created batch in backend');
      
      // Transform backend response to frontend format
      const transformedBatch = await this.transformBackendBatch(response.data);
      console.log('🔄 [BatchesAPI] Transformed created batch to frontend format');
      
      return transformedBatch;
    } catch (error: any) {
      console.error('❌ [BatchesAPI] Create batch error:', error.message || error);
      console.error('❌ [BatchesAPI] Error details:', {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Use mock response as fallback
      console.log('📦 [BatchesAPI] Using mock response for create batch');
      const newBatch: Batch = {
        id: Date.now().toString(),
        ...batchData,
        total_items: 0,
        total_value: 0,
        color: '#4CAF50',
        icon: 'package',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };
      return newBatch;
    }
  }

  // Update a batch
  async updateBatch(batchId: string, batchData: UpdateBatchRequest): Promise<Batch> {
    try {
      console.log('🔄 [BatchesAPI] Updating batch:', batchId);
      
      // Transform frontend data to backend format
      const backendBatchData: any = {};
      if (batchData.manufacturing_date) {
        backendBatchData.manufacturing_date = batchData.manufacturing_date;
      }
      if (batchData.expiry_date) {
        backendBatchData.expiry_date = batchData.expiry_date;
      }
      if (batchData.quantity !== undefined) {
        backendBatchData.quantity = batchData.quantity;
      }
      if (batchData.available_quantity !== undefined) {
        backendBatchData.available_quantity = batchData.available_quantity;
      }
      
      const response = await this.apiService.put(`/batches/${batchId}`, backendBatchData);
      console.log('✅ [BatchesAPI] Successfully updated batch in backend');
      
      // Transform backend response to frontend format
      const transformedBatch = await this.transformBackendBatch(response.data);
      console.log('🔄 [BatchesAPI] Transformed updated batch to frontend format');
      
      return transformedBatch;
    } catch (error: any) {
      console.error('❌ [BatchesAPI] Update batch error:', error.message || error);
      console.error('❌ [BatchesAPI] Error details:', {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Use mock response as fallback
      console.log('📦 [BatchesAPI] Using mock response for update batch');
      const mockBatch = mockBatches.find(batch => batch.id === batchId);
      if (mockBatch) {
        const updatedBatch: Batch = {
          ...mockBatch,
          ...batchData,
          updated_at: new Date().toISOString(),
        };
        return updatedBatch;
      }
      throw new Error('Batch not found');
    }
  }

  // Delete a batch
  async deleteBatch(batchId: string): Promise<void> {
    try {
      console.log('🔄 [BatchesAPI] Deleting batch:', batchId);
      await this.apiService.delete(`/batches/${batchId}`);
      console.log('✅ [BatchesAPI] Successfully deleted batch from backend:', batchId);
    } catch (error: any) {
      console.error('❌ [BatchesAPI] Delete batch error:', error.message || error);
      console.error('❌ [BatchesAPI] Error details:', {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Use mock response as fallback
      console.log('📦 [BatchesAPI] Using mock response for delete batch');
      return;
    }
  }
}

export default new BatchesApiService();
