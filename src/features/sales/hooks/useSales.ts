// src/features/sales/hooks/useSales.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sale, 
  SalesFilters,
  SortField, 
  SortOrder, 
  PaginatedSales, 
  SalesSummary,
  BulkStatusUpdate,
  SaleStatus,
  PaymentStatus
} from '../types/sales.types';
import { salesService } from '../services/salesService';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>({});
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Ordenação local
  const sortSalesLocally = useCallback((salesToSort: Sale[]): Sale[] => {
    if (!salesToSort || !salesToSort.length) return [];
    
    return [...salesToSort].sort((a, b) => {
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

  const sortedSales = useMemo(() => {
    return sortSalesLocally(sales);
  }, [sales, sortSalesLocally]);

  // Carregar vendas
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando vendas com filtros:', { ...filters, page: pagination.page });
      
      const data: PaginatedSales = await salesService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      console.log('Dados de vendas recebidos:', data);
      
      setSales(data.items || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.pages || 1,
        total: data.total || 0,
        limit: data.limit || 20
      });
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, pagination.page, pagination.limit]);

  // Carregar resumo
  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      console.log('📊 Carregando resumo de vendas:', { 
        start_date: dateRange.startDate, 
        end_date: dateRange.endDate 
      });
      
      const data = await salesService.getSummary({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      });
      
      console.log('📦 Dados do resumo recebidos:', data);
      
      setSummary({
        total_revenue: data.total_revenue || 0,
        total_sales: data.total_sales || 0,
        average_ticket: data.average_ticket || 0,
        pending_payment_count: data.pending_payment_count || 0,
        pending_separation_count: data.pending_separation_count || 0,
        top_products: data.top_products || [],
        bottom_products: data.bottom_products || [],
        sales_by_day: data.sales_by_day || [],
        sales_by_status: data.sales_by_status || {
          pending: 0,
          paid: 0,
          separated: 0,
          delivered: 0,
          cancelled: 0
        },
        payment_by_status: data.payment_by_status || {
          pending: 0,
          paid: 0,
          refunded: 0
        }
      });
    } catch (error) {
      console.error('❌ Erro ao carregar resumo:', error);
    } finally {
      setLoadingSummary(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadSales();
      loadSummary();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortField, sortOrder, pagination.page, dateRange, loadSales, loadSummary]);

  // Handlers
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

  const toggleSelectSale = (id: string) => {
    const newSelected = new Set(selectedSales);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSales(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSales.size === sales.length) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(sales.map(s => s.id)));
    }
  };

  const clearSelected = () => {
    setSelectedSales(new Set());
  };

  const handleBulkStatusUpdate = async (data: BulkStatusUpdate) => {
    try {
      console.log('Aplicando ação em lote:', { ...data, sale_ids: Array.from(selectedSales) });
      
      await salesService.bulkUpdateStatus({
        ...data,
        sale_ids: Array.from(selectedSales)
      });
      
      await loadSales();
      await loadSummary();
      clearSelected();
      
      alert('Ação em lote aplicada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status em lote:', error);
      alert('Erro ao aplicar ação em lote');
      throw error;
    }
  };

  const updateSaleStatus = async (id: string, status: SaleStatus) => {
    try {
      console.log('Atualizando status da venda:', { id, status });
      
      await salesService.updateStatus(id, status);
      
      // Atualizar localmente
      setSales(prev => prev.map(s => 
        s.id === id ? { ...s, status } : s
      ));
      
      // Recarregar resumo
      await loadSummary();
      
      alert(`Status atualizado para ${status} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
      throw error;
    }
  };

  const updatePaymentStatus = async (id: string, payment_status: PaymentStatus) => {
    try {
      console.log('Atualizando status de pagamento:', { id, payment_status });
      
      await salesService.updatePaymentStatus(id, payment_status);
      
      // Atualizar localmente
      setSales(prev => prev.map(s => 
        s.id === id ? { ...s, payment_status } : s
      ));
      
      // Recarregar resumo
      await loadSummary();
      
      alert(`Status de pagamento atualizado para ${payment_status} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      alert('Erro ao atualizar status de pagamento');
      throw error;
    }
  };

  const handleSendReceipt = async (sale: Sale) => {
    if (!sale.user_phone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    
    try {
      await salesService.sendReceipt(sale.id, sale.user_phone);
      alert('Comprovante enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      alert('Erro ao enviar comprovante');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await salesService.exportCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendas-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar relatório');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    sales: sortedSales,
    loading,
    summary,
    loadingSummary,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    selectedSales,
    toggleSelectSale,
    toggleSelectAll,
    clearSelected,
    handleBulkStatusUpdate,
    updateSaleStatus,
    updatePaymentStatus,
    handleSendReceipt,
    handleExportCSV,
    expandedId,
    toggleExpand,
    pagination,
    handlePageChange,
    dateRange,
    setDateRange,
    refresh: loadSales
  };
};