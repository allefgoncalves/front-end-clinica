// src/features/sales/types/sales.types.ts

export type SaleStatus = 'pending' | 'paid' | 'separated' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'transfer' | 'other';

export interface SaleItem {
  item_id: string;
  item_type: 'service' | 'product';
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SaleHistory {
  id: string;
  sale_id: string;
  status: SaleStatus;
  payment_status?: PaymentStatus;
  changed_by: string;
  changed_by_name: string;
  changed_at: string;
  notes?: string | null;
}

export interface Sale {
  id: string;
  cart_snapshot_id?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string | null;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: SaleStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod | null;
  promotion_id?: string | null;
  notes?: string | null;
  history?: SaleHistory[];
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  cancelled_at?: string | null;
  estimated_delivery?: string | null;
  source?: 'website' | 'whatsapp' | 'in_person' | 'other';
}

export interface SaleCreate {
  promotion_id?: string | null;
  payment_method?: PaymentMethod | null;
  notes?: string | null;
  discount?: number;
  source?: 'website' | 'whatsapp' | 'in_person' | 'other';
}

export interface SaleUpdate {
  status?: SaleStatus;
  payment_status?: PaymentStatus;
  notes?: string | null;
  estimated_delivery?: string | null;
}

export interface BulkStatusUpdate {
  sale_ids: string[];
  status: SaleStatus;
  payment_status?: PaymentStatus;
  notes?: string;
}

export interface PaginatedSales {
  items: Sale[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// CORRIGIDO: Nome padronizado para SalesFilters (com S)
export interface SalesFilters {
  search?: string;
  status?: SaleStatus | SaleStatus[];
  payment_status?: PaymentStatus | PaymentStatus[];
  start_date?: string;
  end_date?: string;
  user_id?: string;
  source?: string;
  min_total?: number;
  max_total?: number;
  has_items?: 'service' | 'product' | 'both';
}

export type SortField = 'created_at' | 'total' | 'user_name' | 'status' | 'payment_status';
export type SortOrder = 'asc' | 'desc';

export interface SalesSummary {
  total_revenue: number;
  total_sales: number;
  average_ticket: number;
  pending_payment_count: number;
  pending_separation_count: number;
  top_products: {
    product_id: string;
    product_name: string;
    quantity: number;
    revenue: number;
  }[];
  bottom_products: {
    product_id: string;
    product_name: string;
    quantity: number;
    revenue: number;
  }[];
  sales_by_day: {
    date: string;
    count: number;
    revenue: number;
  }[];
  sales_by_status: Record<SaleStatus, number>;
  payment_by_status: Record<PaymentStatus, number>;
}

export interface ReceiptData {
  sale: Sale;
  company_name: string;
  company_document?: string;
  generated_at: string;
}