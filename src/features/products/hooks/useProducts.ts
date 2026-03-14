// src/features/products/hooks/useProducts.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductFilters, SortField, SortOrder, PaginatedProducts, ProductCreate, ProductUpdate } from '../types/product.types';
import { productsService } from '../services/productsService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });

  const sortProductsLocally = useCallback((productsToSort: Product[]): Product[] => {
    // CORREÇÃO: Verificar se productsToSort existe e tem length
    if (!productsToSort || !Array.isArray(productsToSort) || productsToSort.length === 0) {
      return [];
    }
    
    return [...productsToSort].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [sortField, sortOrder]);

  const sortedProducts = useMemo(() => {
    return sortProductsLocally(products);
  }, [products, sortProductsLocally]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando produtos com filtros:', { 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      const data = await productsService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      console.log('Dados recebidos:', data);
      
      // CORREÇÃO: Verificar se data.items existe
      if (data && data.items && Array.isArray(data.items)) {
        setProducts(data.items);
        setPagination({
          page: data.page || 1,
          totalPages: data.pages || 1,
          total: data.total || 0,
          limit: data.limit || 20
        });
      } else {
        console.error('Formato de dados inválido:', data);
        setProducts([]);
        setPagination({
          page: 1,
          totalPages: 1,
          total: 0,
          limit: 20
        });
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, pagination.page, pagination.limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortField, sortOrder, pagination.page, loadProducts]);

  const handleSort = (field: SortField) => {
    let newOrder: SortOrder = 'asc';
    if (sortField === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newOrder = 'asc';
    }
    
    setSortField(field);
    setSortOrder(newOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleStatus = async (product: Product) => {
    try {
      const updated = await productsService.update(product.id, {
        active: !product.active,
      });
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este produto?')) return;
    try {
      await productsService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleFormSave = async (data: ProductCreate) => {
    try {
      if (selectedProduct) {
        const updated = await productsService.update(selectedProduct.id, data);
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));
        setSelectedProduct(null);
      } else {
        const created = await productsService.create(data);
        setProducts(prev => [created, ...prev]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      throw error;
    }
  };

  const handleInlineSave = async (id: string, data: Partial<Product>) => {
    try {
      const updated = await productsService.update(id, data);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Erro ao salvar edição inline:', error);
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    products: sortedProducts,
    loading,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    toggleStatus,
    handleDelete,
    handleEdit,
    handleFormSave,
    handleInlineSave,
    selectedProduct,
    setSelectedProduct,
    showForm,
    setShowForm,
    pagination,
    handlePageChange
  };
};