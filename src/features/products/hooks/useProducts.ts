// src/features/products/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters, SortField, SortOrder, PaginatedProducts, ProductCreate } from '../types/product.types';
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

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando produtos com:', { 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      const data: PaginatedProducts = await productsService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      console.log('Produtos carregados:', data.items.length);
      console.log('Ordenação aplicada:', sortField, sortOrder);
      
      setProducts(data.items);
      setPagination({
        page: data.page,
        totalPages: data.pages,
        total: data.total,
        limit: data.limit
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, pagination.page, pagination.limit]);

  // Recarregar quando os parâmetros de ordenação mudarem
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortField, sortOrder, pagination.page, loadProducts]);

  // Função de ordenação CORRIGIDA
  const handleSort = (field: SortField) => {
    console.log('Ordenando por:', field, 'Atual:', sortField, sortOrder);
    
    // Determinar nova ordem
    let newOrder: SortOrder = 'asc';
    if (sortField === field) {
      // Mesmo campo: alternar ordem
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Campo diferente: começar com asc
      newOrder = 'asc';
    }
    
    // Atualizar estado
    setSortField(field);
    setSortOrder(newOrder);
    
    // Resetar para primeira página ao ordenar
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
    products,
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