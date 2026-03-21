// src/features/dashboard/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { DashboardData, PeriodOption } from '../types/dashboard.types';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = (initialPeriod: PeriodOption = 'day') => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodOption>(initialPeriod);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await dashboardService.getData(period);
      setData(dashboardData);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    period,
    setPeriod,
    refresh: loadData
  };
};