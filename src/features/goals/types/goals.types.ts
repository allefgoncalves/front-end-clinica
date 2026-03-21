
// src/features/goals/types/goals.types.ts

export type GoalType = 'revenue' | 'quantity' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  type: GoalType;
  target: number;
  current: number;
  progress: number;
  unit: string;
  year: number;
  month: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface GoalCreate {
  title: string;
  description?: string | null;
  type: GoalType;
  target: number;
  unit?: string;
  year: number;
  month: number;
}

export interface GoalUpdate {
  title?: string;
  description?: string | null;
  target?: number;
  current?: number;
  status?: GoalStatus;
}

export interface PaginatedGoals {
  items: Goal[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface GoalsFilters {
  year?: number;
  month?: number;
  status?: GoalStatus;
  type?: GoalType;
}

export interface GoalsSummary {
  current_month: {
    revenue: { target: number; current: number; progress: number };
    quantity: { target: number; current: number; progress: number };
  };
  history: Array<{
    year: number;
    month: number;
    revenue_target: number;
    revenue_achieved: number;
    revenue_progress: number;
    quantity_target: number;
    quantity_achieved: number;
    quantity_progress: number;
  }>;
}