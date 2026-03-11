// src/features/appointments/types/appointment.types.ts

export interface AppointmentService {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface Appointment {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string | null;
  services: AppointmentService[];
  total_duration: number;
  total_price: number;
  scheduled_date: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  massagista_id?: string | null;
  massagista_name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AppointmentCreate {
  services: AppointmentService[];
  scheduled_date: string;
  massagista_id?: string | null;
  notes?: string | null;
}

export interface AppointmentUpdate {
  scheduled_date?: string;
  massagista_id?: string | null;
  notes?: string | null;
  status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

export interface PaginatedAppointments {
  items: Appointment[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface AppointmentFilters {
  search?: string;
  status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  start_date?: string;
  end_date?: string;
  massagista_id?: string;
}

export type SortField = 'scheduled_date' | 'user_name' | 'total_price' | 'created_at' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  available_slots: string[];
  business_hours: {
    start: number;
    end: number;
  };
}