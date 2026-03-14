// src/features/services/services/servicesService.ts
import api from '../../../core/services/api';
import { 
  Service, 
  ServiceFilters, 
  ServiceCreate, 
  ServiceUpdate, 
  PaginatedServices,
  SortField,
  SortOrder 
} from '../types/service.types';

export const servicesService = {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    filters?: ServiceFilters;
    sortField?: SortField;
    sortOrder?: SortOrder;
  }): Promise<PaginatedServices> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortField) queryParams.append('sort_by', params.sortField);
    if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);
    
    if (params?.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.active !== undefined) queryParams.append('active', params.filters.active.toString());
      if (params.filters.category) queryParams.append('category', params.filters.category);
      if (params.filters.minPrice) queryParams.append('min_price', params.filters.minPrice.toString());
      if (params.filters.maxPrice) queryParams.append('max_price', params.filters.maxPrice.toString());
      if (params.filters.minDuration) queryParams.append('min_duration', params.filters.minDuration.toString());
      if (params.filters.maxDuration) queryParams.append('max_duration', params.filters.maxDuration.toString());
    }
    
    console.log('📡 API Request Services:', `/services?${queryParams.toString()}`);
    
    const response = await api.get(`/services?${queryParams.toString()}`);
    
    // CORREÇÃO: Garantir que a resposta tenha o formato esperado
    const data = response.data;
    
    // Se a API retornar um array diretamente, converter para formato paginado
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        pages: 1,
        limit: data.length
      };
    }
    
    // Se já estiver no formato paginado, retornar
    if (data && typeof data === 'object') {
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || 1,
        pages: data.pages || 1,
        limit: data.limit || 20
      };
    }
    
    // Fallback
    return {
      items: [],
      total: 0,
      page: 1,
      pages: 1,
      limit: 20
    };
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  async create(data: ServiceCreate): Promise<Service> {
    const response = await api.post('/services', data);
    return response.data;
  },

  async update(id: string, data: ServiceUpdate): Promise<Service> {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/services/categories/list');
    return response.data.categories;
  }
};

export const getServices = servicesService.getAll;
export const getService = servicesService.getById;
export const createService = servicesService.create;
export const updateService = servicesService.update;
export const deleteService = servicesService.delete;
export const getCategories = servicesService.getCategories;