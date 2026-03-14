// src/features/products/services/productsService.ts
import api from '../../../core/services/api';
import { 
  Product, 
  ProductFilters, 
  ProductCreate, 
  ProductUpdate, 
  PaginatedProducts,
  SortField,
  SortOrder 
} from '../types/product.types';

export const productsService = {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    filters?: ProductFilters;
    sortField?: SortField;
    sortOrder?: SortOrder;
  }): Promise<PaginatedProducts> {
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
      if (params.filters.lowStock) queryParams.append('low_stock', 'true');
      if (params.filters.expiringSoon) queryParams.append('expiring_soon', 'true');
    }
    
    console.log('📡 API Request Products:', `/products?${queryParams.toString()}`);
    
    const response = await api.get(`/products?${queryParams.toString()}`);
    
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

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: ProductCreate): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: ProductUpdate): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/products/categories/list');
    return response.data.categories;
  }
};

export const getProducts = productsService.getAll;
export const getProduct = productsService.getById;
export const createProduct = productsService.create;
export const updateProduct = productsService.update;
export const deleteProduct = productsService.delete;
export const getCategories = productsService.getCategories;