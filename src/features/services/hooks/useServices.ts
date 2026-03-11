// src/features/services/hooks/useServices.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Service, ServiceFilters, SortField, SortOrder, PaginatedServices, ServiceCreate } from '../types/service.types';
import { servicesService } from '../services/servicesService';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });

  // Função de ordenação local (fallback)
  const sortServicesLocally = useCallback((servicesToSort: Service[]): Service[] => {
    if (!servicesToSort.length) return servicesToSort;
    
    return [...servicesToSort].sort((a, b) => {
      let aValue: any = a[sortField === 'duration' ? 'duration_minutes' : sortField];
      let bValue: any = b[sortField === 'duration' ? 'duration_minutes' : sortField];
      
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

  // Serviços ordenados localmente
  const sortedServices = useMemo(() => {
    return sortServicesLocally(services);
  }, [services, sortServicesLocally]);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando serviços com:', { 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      const data: PaginatedServices = await servicesService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      setServices(data.items);
      setPagination({
        page: data.page,
        totalPages: data.pages,
        total: data.total,
        limit: data.limit
      });
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, pagination.page, pagination.limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadServices();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortField, sortOrder, pagination.page, loadServices]);

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

  const toggleStatus = async (service: Service) => {
    try {
      const updated = await servicesService.update(service.id, {
        active: !service.active,
      });
      setServices(prev => prev.map(s => s.id === service.id ? updated : s));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este serviço?')) return;
    try {
      await servicesService.delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleFormSave = async (data: ServiceCreate) => {
    try {
      if (selectedService) {
        const updated = await servicesService.update(selectedService.id, data);
        setServices(prev => prev.map(s => s.id === selectedService.id ? updated : s));
        setSelectedService(null);
      } else {
        const created = await servicesService.create(data);
        setServices(prev => [created, ...prev]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      throw error;
    }
  };

  const handleInlineSave = async (id: string, data: Partial<Service>) => {
    try {
      const updated = await servicesService.update(id, data);
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    } catch (error) {
      console.error('Erro ao salvar edição inline:', error);
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    services: sortedServices,
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
    selectedService,
    setSelectedService,
    showForm,
    setShowForm,
    pagination,
    handlePageChange
  };
};