// src/features/appointments/hooks/useAppointments.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Appointment, 
  AppointmentFilters, 
  SortField, 
  SortOrder, 
  PaginatedAppointments, 
  AppointmentCreate 
} from '../types/appointment.types';
import { appointmentsService } from '../services/appointmentsService';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [sortField, setSortField] = useState<SortField>('scheduled_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });

  const sortAppointmentsLocally = useCallback((appointmentsToSort: Appointment[]): Appointment[] => {
    if (!appointmentsToSort.length) return appointmentsToSort;
    
    return [...appointmentsToSort].sort((a, b) => {
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

  const sortedAppointments = useMemo(() => {
    return sortAppointmentsLocally(appointments);
  }, [appointments, sortAppointmentsLocally]);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data: PaginatedAppointments = await appointmentsService.getAll({ 
        page: pagination.page,
        limit: pagination.limit,
        filters, 
        sortField, 
        sortOrder 
      });
      
      setAppointments(data.items);
      setPagination({
        page: data.page,
        totalPages: data.pages,
        total: data.total,
        limit: data.limit
      });
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, pagination.page, pagination.limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadAppointments();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortField, sortOrder, pagination.page, loadAppointments]);

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

  const handleCancel = async (appointment: Appointment) => {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) return;
    
    try {
      await appointmentsService.cancel(appointment.id);
      setAppointments(prev => prev.map(a => 
        a.id === appointment.id ? { ...a, status: 'cancelled' } : a
      ));
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este agendamento?')) return;
    try {
      await appointmentsService.cancel(id); // Ou um método delete se existir
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleFormSave = async (data: AppointmentCreate) => {
    try {
      if (selectedAppointment) {
        const updated = await appointmentsService.update(selectedAppointment.id, data);
        setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
        setSelectedAppointment(null);
      } else {
        const created = await appointmentsService.create(data);
        setAppointments(prev => [created, ...prev]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    appointments: sortedAppointments,
    loading,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    handleCancel,
    handleDelete,
    handleEdit,
    handleFormSave,
    selectedAppointment,
    setSelectedAppointment,
    showForm,
    setShowForm,
    pagination,
    handlePageChange,
    expandedId,
    toggleExpand
  };
};