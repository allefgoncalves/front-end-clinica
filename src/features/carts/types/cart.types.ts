// src/features/carts/types/cart.types.ts

export interface CartItem {
  item_id: string;
  item_type: 'service' | 'product';
  quantity: number;
  name: string;
  price: number;
  total?: number;
}

export interface CartSnapshot {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: CartItem[];
  total: number;
  status: 'ativo' | 'abandonado' | 'convertido';
  last_activity: string;
  created_at: string;
  expires_at: string | null;
  metadata: {
    item_count: number;
    has_products: boolean;
    has_services: boolean;
    user_agent?: string;
    source?: string;
    notes?: string;
    reviewed_at?: string;
    discount_applied?: number;
    original_total?: number;
    discounted_total?: number;
    discount_amount?: number;
    [key: string]: any;
  };
}

export interface CartSnapshotFilter {
  status?: 'ativo' | 'abandonado' | 'convertido'; 
  days?: number;
  user_id?: string;
  min_total?: number;
  max_total?: number;
}

export interface CartSnapshotResponse {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: {
    item_id: string;
    item_type: string;
    quantity: number;
    name: string;
    price: number;
    total: number;
  }[];
  total: number;
  status: string;
  last_activity: string;
  created_at: string;
  expires_at: string | null;
  metadata: Record<string, any>;
}

export interface PaginatedCarts {
  items: CartSnapshot[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface DiscountApply {
  discount_percent: number;
  original_total: number;
  discount_amount: number;
  discounted_total: number;
}