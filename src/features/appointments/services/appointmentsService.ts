// src/features/appointments/services/appointmentsService.ts
import api from '../../../core/services/api';
import { 
  Appointment, 
  AppointmentFilters, 
  AppointmentCreate, 
  AppointmentUpdate, 
  PaginatedAppointments,
  SortField,
  SortOrder,
  AvailableSlotsResponse
} from '../types/appointment.types';

export const appointmentsService = {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    filters?: AppointmentFilters;
    sortField?: SortField;
    sortOrder?: SortOrder;
  }): Promise<PaginatedAppointments> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortField) queryParams.append('sort_by', params.sortField);
    if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);
    
    if (params?.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.status) queryParams.append('status', params.filters.status);
      if (params.filters.start_date) queryParams.append('start_date', params.filters.start_date);
      if (params.filters.end_date) queryParams.append('end_date', params.filters.end_date);
      if (params.filters.massagista_id) queryParams.append('massagista_id', params.filters.massagista_id);
    }
    
    console.log('📡 Buscando agendamentos:', `/appointments?${queryParams.toString()}`);
    const response = await api.get(`/appointments?${queryParams.toString()}`);
    
    // CORREÇÃO: Garantir que a resposta tenha o formato esperado
    const data = response.data;
    
    // Se a API retornar um array diretamente, converter para formato paginado
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
        page: 1,
        pages: 1,
        limit: data.length
      };
    }
    
    // Se já estiver no formato paginado, retornar
    if (data && typeof data === 'object') {
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || 1,
        pages: data.pages || 1,
        limit: data.limit || 20
      };
    }
    
    // Fallback
    return {
      items: [],
      total: 0,
      page: 1,
      pages: 1,
      limit: 20
    };
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async create(data: AppointmentCreate): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  async update(id: string, data: AppointmentUpdate): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  async cancel(id: string): Promise<{ message: string }> {
    const response = await api.post(`/appointments/${id}/cancel`);
    return response.data;
  },

  async getAvailableSlots(date: string, duration: number): Promise<AvailableSlotsResponse> {
    const response = await api.get(`/appointments/available/slots?date=${date}&duration=${duration}`);
    return response.data;
  }
};

export const getAppointments = appointmentsService.getAll;
export const getAppointment = appointmentsService.getById;
export const createAppointment = appointmentsService.create;
export const updateAppointment = appointmentsService.update;
export const cancelAppointment = appointmentsService.cancel;
export const getAvailableSlots = appointmentsService.getAvailableSlots;