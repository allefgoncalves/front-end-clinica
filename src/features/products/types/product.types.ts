// src/features/products/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock: number;
  batch: string | null;
  expiration_date: string | null;
  image_base64: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  batch?: string | null;
  expiration_date?: string | null;
  image_base64?: string | null;
  active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  category?: string | null;
  price?: number;
  stock?: number;
  batch?: string | null;
  expiration_date?: string | null;
  image_base64?: string | null;
  active?: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ProductFilters {
  search?: string;
  active?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export type SortField = 'name' | 'price' | 'stock' | 'expiration_date';
export type SortOrder = 'asc' | 'desc';