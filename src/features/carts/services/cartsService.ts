// src/features/carts/services/cartsService.ts
import api from '../../../core/services/api';
import { 
  CartSnapshot, 
  CartSnapshotFilter, 
  CartSnapshotResponse,
  DiscountApply 
} from '../types/cart.types';

export const cartsService = {
  // Listar snapshots para análise
  async getSnapshots(params?: CartSnapshotFilter): Promise<CartSnapshot[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.min_total) queryParams.append('min_total', params.min_total.toString());
    if (params?.max_total) queryParams.append('max_total', params.max_total.toString());
    
    const response = await api.get(`/cart/admin/snapshots?${queryParams.toString()}`);
    return response.data;
  },

  // Adicionar observações a um snapshot
  async addNotes(snapshotId: string, notes: string): Promise<void> {
    try {
      const response = await api.post(`/cart/admin/snapshots/${snapshotId}/notes`, { 
        notes: notes
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Aplicar desconto simulado - CORREÇÃO 5
  async applyDiscount(snapshotId: string, discountPercent: number): Promise<DiscountApply> {
    // Enviar como corpo da requisição, não como query param
    const response = await api.post(
      `/cart/admin/snapshots/${snapshotId}/discount`,
      { discount_percent: discountPercent } // Enviar no corpo
    );
    return response.data;
  },

  // Forçar criação de snapshot manual (útil para testes)
  async forceSnapshot(): Promise<{ message: string; snapshot_id?: string }> {
    const response = await api.post('/cart/snapshot');
    return response.data;
  },

  // Buscar detalhes de um snapshot específico
  async getSnapshotById(id: string): Promise<CartSnapshot> {
    const response = await api.get(`/cart/admin/snapshots/${id}`);
    return response.data;
  }
};

export const getCartSnapshots = cartsService.getSnapshots;
export const addCartNotes = cartsService.addNotes;
export const applyCartDiscount = cartsService.applyDiscount;
export const forceCartSnapshot = cartsService.forceSnapshot;
export const getCartSnapshotById = cartsService.getSnapshotById;