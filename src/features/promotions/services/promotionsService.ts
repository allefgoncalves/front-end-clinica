// src/features/promotions/services/promotionsService.ts
import api from '../../../core/services/api';
import { 
  Promotion, 
  PromotionFilters, 
  PromotionCreate, 
  PromotionUpdate, 
  PaginatedPromotions,
  SortField,
  SortOrder,
  AvailableItem 
} from '../types/promotion.types';

export const promotionsService = {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    filters?: PromotionFilters;
    sortField?: SortField;
    sortOrder?: SortOrder;
  }): Promise<PaginatedPromotions> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortField) queryParams.append('sort_by', params.sortField);
    if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);
    
    if (params?.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.active !== undefined) queryParams.append('active', params.filters.active.toString());
      if (params.filters.valid !== undefined) queryParams.append('valid', params.filters.valid.toString());
      if (params.filters.minDiscount) queryParams.append('min_discount', params.filters.minDiscount.toString());
      if (params.filters.maxDiscount) queryParams.append('max_discount', params.filters.maxDiscount.toString());
      if (params.filters.itemType && params.filters.itemType !== 'both') {
        queryParams.append('item_type', params.filters.itemType);
      }
    }
    
    console.log('📡 Buscando promoções:', `/promotions?${queryParams.toString()}`);
    const response = await api.get(`/promotions?${queryParams.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Promotion> {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },

  async create(data: PromotionCreate): Promise<Promotion> {
    const response = await api.post('/promotions', data);
    return response.data;
  },

  async update(id: string, data: PromotionUpdate): Promise<Promotion> {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/promotions/${id}`);
  },

  async toggleStatus(id: string): Promise<{ message: string; active: boolean }> {
    const response = await api.put(`/promotions/${id}/toggle`);
    return response.data;
  },

  // Buscar serviços disponíveis (primeira página - 100 itens)
  async getAvailableServices(): Promise<AvailableItem[]> {
    try {
      console.log('📡 Buscando serviços disponíveis (página 1)...');
      const response = await api.get('/services?limit=100');
      const items = response.data.items || [];
      
      return items.map((service: any) => ({
        id: service.id,
        name: service.name,
        type: 'service' as const,
        price: service.price,
        description: service.description,
        image_base64: service.image_base64,
        duration: service.duration_minutes
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error);
      return [];
    }
  },

  // Buscar produtos disponíveis (primeira página - 100 itens)
  async getAvailableProducts(): Promise<AvailableItem[]> {
    try {
      console.log('📡 Buscando produtos disponíveis (página 1)...');
      const response = await api.get('/products?limit=100');
      const items = response.data.items || [];
      
      return items.map((product: any) => ({
        id: product.id,
        name: product.name,
        type: 'product' as const,
        price: product.price,
        description: product.description,
        image_base64: product.image_base64,
        stock: product.stock
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }
  },

  // Buscar TODOS os serviços (todas as páginas)
  async getAllServices(): Promise<AvailableItem[]> {
    try {
      console.log('📡 Buscando TODOS os serviços...');
      
      // Primeira página para pegar o total
      const firstPage = await api.get('/services?page=1&limit=100');
      const total = firstPage.data.total;
      const totalPages = Math.ceil(total / 100);
      
      console.log(`   Total de serviços: ${total} (${totalPages} páginas)`);
      
      let allServices = [...firstPage.data.items];
      
      // Buscar páginas restantes
      for (let page = 2; page <= totalPages; page++) {
        console.log(`   Buscando página ${page} de ${totalPages}...`);
        const response = await api.get(`/services?page=${page}&limit=100`);
        allServices = [...allServices, ...response.data.items];
      }
      
      console.log(`✅ Total de serviços carregados: ${allServices.length}`);
      
      return allServices.map((service: any) => ({
        id: service.id,
        name: service.name,
        type: 'service' as const,
        price: service.price,
        description: service.description,
        image_base64: service.image_base64,
        duration: service.duration_minutes
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar todos os serviços:', error);
      return [];
    }
  },

  // Buscar TODOS os produtos (todas as páginas)
  async getAllProducts(): Promise<AvailableItem[]> {
    try {
      console.log('📡 Buscando TODOS os produtos...');
      
      // Primeira página para pegar o total
      const firstPage = await api.get('/products?page=1&limit=100');
      const total = firstPage.data.total;
      const totalPages = Math.ceil(total / 100);
      
      console.log(`   Total de produtos: ${total} (${totalPages} páginas)`);
      
      let allProducts = [...firstPage.data.items];
      
      // Buscar páginas restantes
      for (let page = 2; page <= totalPages; page++) {
        console.log(`   Buscando página ${page} de ${totalPages}...`);
        const response = await api.get(`/products?page=${page}&limit=100`);
        allProducts = [...allProducts, ...response.data.items];
      }
      
      console.log(`✅ Total de produtos carregados: ${allProducts.length}`);
      
      return allProducts.map((product: any) => ({
        id: product.id,
        name: product.name,
        type: 'product' as const,
        price: product.price,
        description: product.description,
        image_base64: product.image_base64,
        stock: product.stock
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar todos os produtos:', error);
      return [];
    }
  },

  // Buscar todos os itens disponíveis (TODAS as páginas)
  async getAllAvailableItems(): Promise<{ services: AvailableItem[], products: AvailableItem[] }> {
    console.log('🔍 Iniciando busca de TODOS os itens disponíveis...');
    
    try {
      // Buscar serviços e produtos em paralelo
      const [services, products] = await Promise.all([
        this.getAllServices(),
        this.getAllProducts()
      ]);
      
      console.log('✅ Busca concluída:');
      console.log(`   - Serviços: ${services.length}`);
      console.log(`   - Produtos: ${products.length}`);
      
      return { services, products };
    } catch (error) {
      console.error('❌ Erro na busca de itens:', error);
      return { services: [], products: [] };
    }
  }
};

export const getPromotions = promotionsService.getAll;
export const getPromotion = promotionsService.getById;
export const createPromotion = promotionsService.create;
export const updatePromotion = promotionsService.update;
export const deletePromotion = promotionsService.delete;
export const togglePromotion = promotionsService.toggleStatus;
export const getAvailableItems = promotionsService.getAllAvailableItems;