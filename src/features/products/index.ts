// src/features/products/index.ts
export { default as Products } from './pages/Products/Products';
export { ProductTable } from './components/ProductTable';
export { ProductFilters } from './components/ProductFilters';
export { useProducts } from './hooks/index';
export * from './services/productsService';
export * from './types/product.types';