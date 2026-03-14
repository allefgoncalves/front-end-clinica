// src/features/sales/services/salesService.ts
import api from '../../../core/services/api';
import { 
  Sale, 
  SalesFilters, 
  SaleCreate, 
  SaleUpdate, 
  PaginatedSales,
  SortField,
  SortOrder,
  SalesSummary,
  BulkStatusUpdate,
  ReceiptData
} from '../types/sales.types';

export const salesService = {
  // Listar vendas com filtros
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    filters?: SalesFilters;
    sortField?: SortField;
    sortOrder?: SortOrder;
  }): Promise<PaginatedSales> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortField) queryParams.append('sort_by', params.sortField);
    if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);
    
    if (params?.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.status) {
        if (Array.isArray(params.filters.status)) {
          params.filters.status.forEach(s => queryParams.append('status', s as string));
        } else {
          queryParams.append('status', params.filters.status as string);
        }
      }
      if (params.filters.payment_status) {
        if (Array.isArray(params.filters.payment_status)) {
          params.filters.payment_status.forEach(ps => queryParams.append('payment_status', ps as string));
        } else {
          queryParams.append('payment_status', params.filters.payment_status as string);
        }
      }
      if (params.filters.start_date) queryParams.append('start_date', params.filters.start_date);
      if (params.filters.end_date) queryParams.append('end_date', params.filters.end_date);
      if (params.filters.user_id) queryParams.append('user_id', params.filters.user_id);
      if (params.filters.source) queryParams.append('source', params.filters.source);
      if (params.filters.min_total) queryParams.append('min_total', params.filters.min_total.toString());
      if (params.filters.max_total) queryParams.append('max_total', params.filters.max_total.toString());
    }
    
    const response = await api.get(`/sales?${queryParams.toString()}`);
    
    const data = response.data;
    
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
      limit: data.limit || 20
    };
  },

  // Buscar venda por ID
  async getById(id: string): Promise<Sale> {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Criar venda a partir do carrinho
  async createFromCart(data: SaleCreate): Promise<Sale> {
    const response = await api.post('/sales/from-cart', data);
    return response.data;
  },

  // Atualizar status da venda
  async updateStatus(id: string, status: string): Promise<{ message: string }> {
    const response = await api.put(`/sales/${id}/status`, { status });
    return response.data;
  },

  // Atualizar status de pagamento
  async updatePaymentStatus(id: string, payment_status: string): Promise<{ message: string }> {
    const response = await api.put(`/sales/${id}/payment`, { payment_status });
    return response.data;
  },

  // Atualizar venda
  async update(id: string, data: SaleUpdate): Promise<Sale> {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },

  // Ações em lote
  async bulkUpdateStatus(data: BulkStatusUpdate): Promise<{ message: string }> {
    const response = await api.post('/sales/bulk-status', data);
    return response.data;
  },

  // Deletar venda (soft delete)
  async delete(id: string): Promise<void> {
    await api.delete(`/sales/${id}`);
  },

  // Buscar resumo das vendas
  async getSummary(filters?: SalesFilters): Promise<SalesSummary> {
    const queryParams = new URLSearchParams();
    
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    
    const response = await api.get(`/sales/summary?${queryParams.toString()}`);
    return response.data;
  },

  // Enviar comprovante por WhatsApp
  async sendReceipt(id: string, phone: string): Promise<{ message: string }> {
    const response = await api.post(`/sales/${id}/send-receipt`, { phone });
    return response.data;
  },

  // Exportar vendas para CSV
  async exportCSV(filters?: SalesFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => queryParams.append('status', s as string));
      } else {
        queryParams.append('status', filters.status as string);
      }
    }
    
    const response = await api.get(`/sales/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const getSales = salesService.getAll;
export const getSale = salesService.getById;
export const createSaleFromCart = salesService.createFromCart;
export const updateSaleStatus = salesService.updateStatus;
export const updatePaymentStatus = salesService.updatePaymentStatus;
export const updateSale = salesService.update;
export const bulkUpdateSales = salesService.bulkUpdateStatus;
export const deleteSale = salesService.delete;
export const getSalesSummary = salesService.getSummary;
export const sendReceipt = salesService.sendReceipt;
export const exportSalesCSV = salesService.exportCSV;