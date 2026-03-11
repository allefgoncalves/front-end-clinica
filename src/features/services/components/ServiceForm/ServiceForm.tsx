// src/features/services/components/ServiceForm/ServiceForm.tsx
import React, { useState, useEffect } from 'react';
import { Service, ServiceCreate } from '../../types/service.types';
import styles from './ServiceForm.module.css';

interface ServiceFormProps {
  service?: Service | null;
  onSave: (data: ServiceCreate) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = [
  'Massagem Relaxante',
  'Massagem Terapêutica',
  'Drenagem Linfática',
  'Quick Massagem',
  'Massagem Oriental',
  'Massagem Estética',
  'Pacotes',
  'Tratamentos Especiais'
];

export const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<ServiceCreate>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    category: '',
    image_base64: null,
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        category: service.category || '',
        image_base64: service.image_base64,
        active: service.active,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{service ? '✏️ Editar Serviço' : '➕ Novo Serviço'}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Digite o nome do serviço"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Descrição do serviço"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="duration_minutes">Duração (minutos) *</label>
              <input
                type="number"
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="5"
                step="5"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Preço (R$) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Categoria</label>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                <span>Serviço Ativo</span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Salvando...' : (service ? 'Salvar Alterações' : 'Criar Serviço')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};