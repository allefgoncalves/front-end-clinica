// src/features/dashboard/types/dashboard.types.ts

export interface KPI {
  label: string;
  value: number | string;
  icon: string;
  link: string;
  color: string;
  alert?: boolean;
  alertMessage?: string;
}

export interface SalesByDay {
  date: string;
  count: number;
  revenue: number;
}

export interface StatusCount {
  pending: number;
  paid: number;
  separated: number;
  delivered: number;
  cancelled: number;
}

export interface TopItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface PromotionAlert {
  id: string;
  title: string;
  status: 'starting' | 'ending_soon' | 'ending_today';
  days: number;
  starts_at?: string;
  ends_at?: string;
}

export interface AppointmentItem {
  id: string;
  time: string;
  client: string;
  service: string;
  status: string;
}

export interface AbandonedCart {
  client: string;
  items: number;
  total: number;
  cart_id: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
}

export interface ExpiringProduct {
  id: string;
  name: string;
  expiry_date: string;
  days_left: number;
  stock: number;
}

export interface DashboardData {
  kpis: {
    sales_today: { count: number; revenue: number };
    appointments_today: number;
    low_stock_count: number;
    expiring_soon_count: number;
    monthly_revenue: number;
  };
  charts: {
    sales_by_day: SalesByDay[];
    sales_by_status: StatusCount;
    top_products: TopItem[];
    top_services: TopItem[];
  };
  lists: {
    upcoming_appointments: AppointmentItem[];
    abandoned_carts: AbandonedCart[];
    low_stock_products: LowStockItem[];
    expiring_products: ExpiringProduct[];
  };
  promotions: {
    starting_soon: PromotionAlert[];
    ending_soon: PromotionAlert[];
    ending_today: PromotionAlert[];
  };
  alerts: Array<{
    type: string;
    message: string;
    link: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export type PeriodOption = 'day' | 'week' | 'month';