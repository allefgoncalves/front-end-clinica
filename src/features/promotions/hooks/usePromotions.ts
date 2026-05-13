// src/features/promotions/hooks/usePromotions.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Promotion, 
  PromotionFilters, 
  SortField, 
  SortOrder, 
  PaginatedPromotions, 
  PromotionCreate,
  AvailableItem 
} from '../types/promotion.types';
import { promotionsService } from '../services/promotionsService';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PromotionFilters>({});
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });

  // Estados para busca de itens disponíveis
  const [availableServices, setAvailableServices] = useState<AvailableItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<AvailableItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const sortPromotionsLocally = useCallback((promotionsToSort: Promotion[]): Promotion[] => {
    if (!promotionsToSort.length) return promotionsToSort;
    
    return [...promotionsToSort].sort((a, b) => {
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

  const sortedPromotions = useMemo(() => {
    return sortPromotionsLocally(promotions);
  }, [promotions, sortPromotionsLocally]);

  const loadPromotions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando promoções com filtros:', filters);
      
      const data: PaginatedPromotions = await promotionsService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      setPromotions(data.items);
      setPagination({
        page: data.page,
        totalPages: data.pages,
        total: data.total,
        limit: data.limit
      });
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, pagination.page, pagination.limit]);

  // Carregar itens disponíveis
  const loadAvailableItems = useCallback(async () => {
    setLoadingItems(true);
    console.log('🔍 Carregando TODOS os itens disponíveis...');
    try {
      const { services, products } = await promotionsService.getAllAvailableItems();
      console.log('✅ Serviços carregados:', services.length);
      console.log('✅ Produtos carregados:', products.length);
      
      setAvailableServices(services);
      setAvailableProducts(products);
    } catch (error) {
      console.error('❌ Erro ao carregar itens disponíveis:', error);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // Carregar itens automaticamente quando o hook for montado
  useEffect(() => {
    loadAvailableItems();
  }, [loadAvailableItems]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPromotions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortField, sortOrder, pagination.page, loadPromotions]);

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleStatus = async (promotion: Promotion) => {
    try {
      const result = await promotionsService.toggleStatus(promotion.id);
      setPromotions(prev => prev.map(p => 
        p.id === promotion.id ? { ...p, active: result.active } : p
      ));
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta promoção?')) return;
    try {
      await promotionsService.delete(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir promoção:', error);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  const handleNewPromotion = () => {
    setSelectedPromotion(null);
    setShowForm(true);
  };

  const handleFormSave = async (data: PromotionCreate) => {
    try {
      // CORREÇÃO: Garantir que os itens tenham quantidade
      const itemsWithQuantity = data.items.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      
      const dataToSave = { ...data, items: itemsWithQuantity };
      
      if (selectedPromotion) {
        const updated = await promotionsService.update(selectedPromotion.id, dataToSave);
        setPromotions(prev => prev.map(p => p.id === selectedPromotion.id ? updated : p));
        setSelectedPromotion(null);
      } else {
        const created = await promotionsService.create(dataToSave);
        setPromotions(prev => [created, ...prev]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      throw error;
    }
  };

  const handleInlineSave = async (id: string, data: Partial<Promotion>) => {
    try {
      const updated = await promotionsService.update(id, data);
      setPromotions(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Erro ao salvar edição inline:', error);
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    promotions: sortedPromotions,
    loading,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    toggleStatus,
    handleDelete,
    handleEdit,
    handleNewPromotion,
    handleFormSave,
    handleInlineSave,
    selectedPromotion,
    setSelectedPromotion,
    showForm,
    setShowForm,
    pagination,
    handlePageChange,
    expandedId,
    toggleExpand,
    availableServices,
    availableProducts,
    loadingItems
  };
};