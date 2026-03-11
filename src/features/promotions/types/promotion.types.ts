// src/features/promotions/types/promotion.types.ts

export interface PromotionItem {
  item_id: string;
  item_type: 'service' | 'product';
  name: string;
  original_price: number;
  quantity?: number;
  image_base64?: string | null;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  items: PromotionItem[];
  combo_price: number | null;
  image_base64: string | null;
  active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PromotionCreate {
  title: string;
  description: string;
  discount_percentage: number | null;  // Alterado para aceitar null
  items: PromotionItem[];
  combo_price?: number | null;
  image_base64?: string | null;
  active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface PromotionUpdate {
  title?: string;
  description?: string;
  discount_percentage?: number | null;  // Alterado para aceitar null
  items?: PromotionItem[];
  combo_price?: number | null;
  image_base64?: string | null;
  active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface PaginatedPromotions {
  items: Promotion[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PromotionFilters {
  search?: string;
  active?: boolean;
  valid?: boolean;
  minDiscount?: number;
  maxDiscount?: number;
  itemType?: 'service' | 'product' | 'both';
}

export type SortField = 'title' | 'discount_percentage' | 'valid_from' | 'valid_until' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface AvailableItem {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  description?: string;
  image_base64?: string | null;
  stock?: number;
  duration?: number;
}