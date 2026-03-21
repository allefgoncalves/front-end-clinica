// src/features/goals/hooks/useGoals.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  Goal, 
  GoalsFilters, 
  PaginatedGoals,
  GoalCreate,
  GoalUpdate,
  GoalStatus
} from '../types/goals.types';
import { goalsService } from '../services/goalsService';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoals, setCurrentGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GoalsFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data: PaginatedGoals = await goalsService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters 
      });
      
      setGoals(data.items || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.pages || 1,
        total: data.total || 0,
        limit: data.limit || 20
      });
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const loadCurrentGoals = useCallback(async () => {
    try {
      const data = await goalsService.getCurrent();
      setCurrentGoals(data || []);
    } catch (error) {
      console.error('Erro ao carregar metas atuais:', error);
      setCurrentGoals([]);
    }
  }, []);

  useEffect(() => {
    loadGoals();
    loadCurrentGoals();
  }, [loadGoals, loadCurrentGoals]);

  const handleCreate = async (data: GoalCreate) => {
    try {
      await goalsService.create(data);
      await loadGoals();
      await loadCurrentGoals();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      throw error;
    }
  };

  const handleUpdate = async (id: string, data: GoalUpdate) => {
    try {
      await goalsService.update(id, data);
      await loadGoals();
      await loadCurrentGoals();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta meta?')) return;
    try {
      await goalsService.delete(id);
      await loadGoals();
      await loadCurrentGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    goals,
    currentGoals,
    loading,
    filters,
    setFilters: (newFilters: GoalsFilters) => setFilters(newFilters),
    pagination,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    refresh: loadGoals
  };
};