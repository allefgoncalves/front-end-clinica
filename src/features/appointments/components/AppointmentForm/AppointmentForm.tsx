// src/features/appointments/components/AppointmentForm/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentCreate, AppointmentService } from '../../types/appointment.types';
import styles from './AppointmentForm.module.css';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSave: (data: AppointmentCreate) => Promise<void>;
  onClose: () => void;
}

// Mock de serviços disponíveis (em produção, viriam da API)
const AVAILABLE_SERVICES: AppointmentService[] = [
  { id: '1', name: 'Massagem Relaxante', duration_minutes: 60, price: 120 },
  { id: '2', name: 'Quick Massagem', duration_minutes: 20, price: 45 },
  { id: '3', name: 'Massagem com Pedras Quentes', duration_minutes: 90, price: 180 },
  { id: '4', name: 'Drenagem Linfática', duration_minutes: 60, price: 130 },
  { id: '5', name: 'Shiatsu', duration_minutes: 60, price: 140 },
];

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<AppointmentCreate>({
    services: [],
    scheduled_date: '',
    massagista_id: null,
    notes: null,
  });
  const [selectedServices, setSelectedServices] = useState<AppointmentService[]>([]);
  const [availableServices, setAvailableServices] = useState<AppointmentService[]>(AVAILABLE_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setSelectedServices(appointment.services);
      setFormData({
        services: appointment.services,
        scheduled_date: appointment.scheduled_date.split('.')[0], // Remove milliseconds
        massagista_id: appointment.massagista_id,
        notes: appointment.notes,
      });
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert('Selecione pelo menos um serviço');
      return;
    }
    
    setLoading(true);
    try {
      await onSave({
        ...formData,
        services: selectedServices,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredServices = availableServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = (service: AppointmentService) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{appointment ? '✏️ Editar Agendamento' : '➕ Novo Agendamento'}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Seção de Serviços */}
          <div className={styles.servicesSection}>
            <h3>🧖 Serviços</h3>
            
            <div className={styles.serviceSearch}>
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={styles.searchInput}
              />
              
              {showDropdown && searchTerm && (
                <div className={styles.dropdown}>
                  {filteredServices.length === 0 ? (
                    <div className={styles.dropdownEmpty}>Nenhum serviço encontrado</div>
                  ) : (
                    filteredServices.map(service => (
                      <div
                        key={service.id}
                        className={styles.dropdownItem}
                        onClick={() => handleAddService(service)}
                      >
                        <span className={styles.serviceName}>{service.name}</span>
                        <span className={styles.serviceDuration}>{service.duration_minutes}min</span>
                        <span className={styles.servicePrice}>{formatCurrency(service.price)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className={styles.selectedServices}>
              {selectedServices.length === 0 ? (
                <p className={styles.emptyServices}>Nenhum serviço selecionado</p>
              ) : (
                selectedServices.map(service => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceInfo}>
                      <span className={styles.serviceName}>{service.name}</span>
                      <span className={styles.serviceDetails}>
                        {service.duration_minutes}min - {formatCurrency(service.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service.id)}
                      className={styles.removeButton}
                      title="Remover serviço"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className={styles.servicesSummary}>
                <div className={styles.summaryRow}>
                  <span>Total de serviços:</span>
                  <strong>{selectedServices.length}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Duração total:</span>
                  <strong>{calculateTotalDuration()} minutos</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Valor total:</span>
                  <strong>{formatCurrency(calculateTotal())}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Data e Hora */}
          <div className={styles.formGroup}>
            <label htmlFor="scheduled_date">Data e Hora *</label>
            <input
              type="datetime-local"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              className={styles.input}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Massagista */}
          <div className={styles.formGroup}>
            <label htmlFor="massagista_id">ID do Massagista (opcional)</label>
            <input
              type="text"
              id="massagista_id"
              name="massagista_id"
              value={formData.massagista_id || ''}
              onChange={handleChange}
              placeholder="Digite o ID do massagista"
              className={styles.input}
            />
          </div>

          {/* Observações */}
          <div className={styles.formGroup}>
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Observações sobre o agendamento"
              className={styles.textarea}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || selectedServices.length === 0} 
              className={styles.saveButton}
            >
              {loading ? 'Salvando...' : (appointment ? 'Salvar Alterações' : 'Criar Agendamento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};