// src/features/dashboard/services/dashboardService.ts
import api from '../../../core/services/api';
import { DashboardData, PeriodOption } from '../types/dashboard.types';

export const dashboardService = {
  async getData(period: PeriodOption = 'day'): Promise<DashboardData> {
    const response = await api.get(`/dashboard?period=${period}`);
    return response.data;
  }
};

export const getDashboardData = dashboardService.getData;