// src/features/products/components/ProductForm/ProductForm.tsx
import React, { useState, useEffect } from 'react';
import { Product, ProductCreate } from '../../types/product.types';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  product?: Product | null;
  onSave: (data: ProductCreate) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = [
  'Óleos Essenciais',
  'Cremes',
  'Acessórios',
  'Equipamentos',
  'Velas Aromáticas',
  'Incensos',
  'Massageadores',
  'Aromatizadores'
];

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    batch: '',
    expiration_date: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category || '',
        batch: product.batch || '',
        expiration_date: product.expiration_date || '',
        active: product.active,
      });
    }
  }, [product]);

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
          <h2>{product ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
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
              placeholder="Digite o nome do produto"
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
              placeholder="Descrição do produto"
            />
          </div>

          <div className={styles.formRow}>
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

            <div className={styles.formGroup}>
              <label htmlFor="stock">Estoque *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
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
              <label htmlFor="batch">Lote</label>
              <input
                type="text"
                id="batch"
                name="batch"
                value={formData.batch || ''}
                onChange={handleChange}
                placeholder="Número do lote"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiration_date">Data de Validade</label>
              <input
                type="date"
                id="expiration_date"
                name="expiration_date"
                value={formData.expiration_date || ''}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className={styles.checkboxGroup}>
              <div className={styles.hiddenLabel}>Status</div> {/* Label invisível para manter altura */}
              <div className={styles.checkboxContainer}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span>Produto Ativo</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Salvando...' : (product ? 'Salvar Alterações' : 'Criar Produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};