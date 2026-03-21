// src/features/goals/components/GoalForm/GoalForm.tsx
import React, { useState, useEffect } from 'react';
import { Goal, GoalCreate } from '../../types/goals.types';
import styles from './GoalForm.module.css';

interface GoalFormProps {
  goal?: Goal | null;
  onSave: (data: GoalCreate) => Promise<void>;
  onClose: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ goal, onSave, onClose }) => {
  const [formData, setFormData] = useState<GoalCreate>({
    title: '',
    description: '',
    type: 'revenue',
    target: 0,
    unit: 'R$',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        type: goal.type,
        target: goal.target,
        unit: goal.unit,
        year: goal.year,
        month: goal.month
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{goal ? '✏️ Editar Meta' : '➕ Nova Meta'}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Título *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Meta de Vendas do Mês"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''} // CORREÇÃO: usa string vazia se null/undefined
              onChange={handleChange}
              rows={3}
              placeholder="Descreva a meta (opcional)"
              className={styles.textarea}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Tipo</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="revenue">💰 Receita</option>
                <option value="quantity">📦 Quantidade</option>
                <option value="custom">🎯 Personalizado</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="unit">Unidade</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder={formData.type === 'revenue' ? 'R$' : 'vendas'}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="target">Meta *</label>
            <input
              type="number"
              id="target"
              name="target"
              value={formData.target}
              onChange={handleChange}
              min="0"
              step={formData.type === 'revenue' ? '0.01' : '1'}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="year">Ano</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={styles.select}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="month">Mês</label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className={styles.select}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Salvando...' : (goal ? 'Salvar Alterações' : 'Criar Meta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};