// src/features/goals/services/goalsService.ts
import api from '../../../core/services/api';
import { 
  Goal, 
  GoalCreate, 
  GoalUpdate, 
  GoalsFilters,
  PaginatedGoals,
  GoalsSummary 
} from '../types/goals.types';

export const goalsService = {
  // Listar metas com filtros
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    filters?: GoalsFilters;
  }): Promise<PaginatedGoals> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    if (params?.filters) {
      if (params.filters.year) queryParams.append('year', params.filters.year.toString());
      if (params.filters.month) queryParams.append('month', params.filters.month.toString());
      if (params.filters.status) queryParams.append('status', params.filters.status);
      if (params.filters.type) queryParams.append('type', params.filters.type);
    }
    
    const response = await api.get(`/goals?${queryParams.toString()}`);
    return response.data;
  },

  // Buscar metas do mês atual
  async getCurrent(): Promise<Goal[]> {
    const response = await api.get('/goals/current');
    return response.data;
  },

  // Buscar histórico de metas
  async getHistory(months: number = 12): Promise<GoalsSummary> {
    const response = await api.get(`/goals/history?months=${months}`);
    return response.data;
  },

  // Buscar meta por ID
  async getById(id: string): Promise<Goal> {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  // Criar nova meta
  async create(data: GoalCreate): Promise<Goal> {
    const response = await api.post('/goals', data);
    return response.data;
  },

  // Atualizar meta
  async update(id: string, data: GoalUpdate): Promise<Goal> {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  // Deletar meta (soft delete)
  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  }
};

export const getGoals = goalsService.getAll;
export const getCurrentGoals = goalsService.getCurrent;
export const getGoalsHistory = goalsService.getHistory;
export const getGoal = goalsService.getById;
export const createGoal = goalsService.create;
export const updateGoal = goalsService.update;
export const deleteGoal = goalsService.delete;