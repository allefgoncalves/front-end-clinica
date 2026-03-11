// src/features/services/types/service.types.ts
export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  image_base64: string | null;
  category: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ServiceCreate {
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  image_base64?: string | null;
  category?: string | null;
  active?: boolean;
}

export interface ServiceUpdate {
  name?: string;
  description?: string | null;
  duration_minutes?: number;
  price?: number;
  image_base64?: string | null;
  category?: string | null;
  active?: boolean;
}

export interface PaginatedServices {
  items: Service[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ServiceFilters {
  search?: string;
  active?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
}

export type SortField = 'name' | 'price' | 'duration' | 'created_at';
export type SortOrder = 'asc' | 'desc';