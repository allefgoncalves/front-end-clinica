// src/features/promotions/components/PromotionForm/PromotionForm.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Promotion, PromotionCreate, PromotionItem, AvailableItem } from '../../types/promotion.types';
import styles from './PromotionForm.module.css';

// Função para remover acentos e normalizar texto
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

interface PromotionFormProps {
  promotion?: Promotion | null;
  onSave: (data: PromotionCreate) => Promise<void>;
  onClose: () => void;
  availableServices?: AvailableItem[];
  availableProducts?: AvailableItem[];
  loadingItems?: boolean;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  promotion,
  onSave,
  onClose,
  availableServices = [],
  availableProducts = [],
  loadingItems = false
}) => {
  const [formData, setFormData] = useState<PromotionCreate>({
    title: '',
    description: '',
    discount_percentage: null,  // Começa como null
    items: [],
    combo_price: null,
    image_base64: null,
    active: true,
    valid_from: null,
    valid_until: null,
  });
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<'service' | 'product'>('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [lastEdited, setLastEdited] = useState<'discount' | 'combo' | null>(null);

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title,
        description: promotion.description,
        discount_percentage: promotion.discount_percentage,
        items: promotion.items,
        combo_price: promotion.combo_price,
        image_base64: promotion.image_base64,
        active: promotion.active,
        valid_from: promotion.valid_from,
        valid_until: promotion.valid_until,
      });
      setItems(promotion.items);
    }
  }, [promotion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...formData, items });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  // CORREÇÃO: Cálculo automático entre desconto e preço do combo
  const calculateTotalOriginal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.original_price * (item.quantity || 1)), 0);
  }, [items]);

  const handleDiscountChange = (value: string) => {
    const discount = value === '' ? null : Number(value);
    
    // Usando função updater para evitar problemas de tipo
    setFormData(prev => ({ ...prev, discount_percentage: discount }));
    setLastEdited('discount');
    
    // Se tem desconto, calcular combo_price
    if (discount && discount > 0) {
      const originalTotal = calculateTotalOriginal();
      const comboPrice = originalTotal * (1 - discount / 100);
      setFormData(prev => ({ ...prev, combo_price: Math.round(comboPrice * 100) / 100 }));
    } else if (discount === null || discount === 0) {
      setFormData(prev => ({ ...prev, combo_price: null }));
    }
  };

  const handleComboPriceChange = (value: string) => {
    const comboPrice = value === '' ? null : Number(value);
    
    setFormData(prev => ({ ...prev, combo_price: comboPrice }));
    setLastEdited('combo');
    
    // Se tem combo_price, calcular desconto
    if (comboPrice && comboPrice > 0) {
      const originalTotal = calculateTotalOriginal();
      if (originalTotal > 0) {
        const discount = ((originalTotal - comboPrice) / originalTotal) * 100;
        setFormData(prev => ({ 
          ...prev, 
          discount_percentage: Math.max(0, Math.min(100, Math.round(discount * 10) / 10))
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, discount_percentage: null }));
    }
  };

  // Recalcular quando itens mudarem, se necessário
  useEffect(() => {
    if (lastEdited === 'discount' && formData.discount_percentage) {
      const originalTotal = calculateTotalOriginal();
      const comboPrice = originalTotal * (1 - (formData.discount_percentage || 0) / 100);
      setFormData(prev => ({ ...prev, combo_price: Math.round(comboPrice * 100) / 100 }));
    } else if (lastEdited === 'combo' && formData.combo_price) {
      const originalTotal = calculateTotalOriginal();
      if (originalTotal > 0) {
        const discount = ((originalTotal - (formData.combo_price || 0)) / originalTotal) * 100;
        setFormData(prev => ({ 
          ...prev, 
          discount_percentage: Math.max(0, Math.min(100, Math.round(discount * 10) / 10))
        }));
      }
    }
  }, [items, lastEdited, formData.discount_percentage, formData.combo_price, calculateTotalOriginal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      // Tratamento especial para campos de desconto e combo
      if (name === 'discount_percentage') {
        handleDiscountChange(value);
      } else if (name === 'combo_price') {
        handleComboPriceChange(value);
      } else {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value === '' ? null : Number(value) 
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Filtrar itens baseado no termo de busca (sem acentos)
  const filteredItems = useMemo(() => {
    const items = selectedItemType === 'service' ? availableServices : availableProducts;
    
    if (!searchTerm.trim()) return [];
    
    const normalizedSearch = normalizeText(searchTerm);
    
    return items.filter(item => {
      const normalizedName = normalizeText(item.name);
      const normalizedDescription = item.description ? normalizeText(item.description) : '';
      
      return normalizedName.includes(normalizedSearch) || 
             normalizedDescription.includes(normalizedSearch);
    }).slice(0, 10);
  }, [selectedItemType, searchTerm, availableServices, availableProducts]);

  const handleSelectItem = (item: AvailableItem) => {
    setSelectedItemId(item.id);
    setSearchTerm(item.name);
    setShowDropdown(false);
  };

  const handleAddItem = () => {
    if (!selectedItemId) {
      alert('Selecione um item para adicionar');
      return;
    }

    const availableItems = selectedItemType === 'service' ? availableServices : availableProducts;
    const selectedItem = availableItems.find(item => item.id === selectedItemId);

    if (!selectedItem) return;

    // Verificar se o item já foi adicionado
    const existingItem = items.find(item => item.item_id === selectedItemId);
    if (existingItem) {
      alert('Este item já foi adicionado à promoção');
      return;
    }

    const newItem: PromotionItem = {
      item_id: selectedItem.id,
      item_type: selectedItem.type,
      name: selectedItem.name,
      original_price: selectedItem.price,
      quantity: itemQuantity,
      image_base64: selectedItem.image_base64
    };

    setItems([...items, newItem]);
    
    // Resetar seleção
    setSelectedItemId('');
    setSearchTerm('');
    setItemQuantity(1);
  };

  // Editar quantidade de item
  const handleEditQuantity = (index: number, currentQuantity: number) => {
    setEditingItemIndex(index);
    setEditingQuantity(currentQuantity);
  };

  const handleSaveQuantity = (index: number) => {
    if (editingQuantity < 1) return;
    
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: editingQuantity
    };
    setItems(updatedItems);
    setEditingItemIndex(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateDiscountedTotal = () => {
    const originalTotal = calculateTotalOriginal();
    
    // Se combo_price foi definido, usar ele
    if (formData.combo_price !== null && formData.combo_price !== undefined && formData.combo_price > 0) {
      return formData.combo_price;
    }
    
    // Caso contrário, calcular baseado no percentual
    return originalTotal * (1 - (formData.discount_percentage || 0) / 100);
  };

  // Calcular desconto implícito quando combo_price é definido
  const calculateImpliedDiscount = () => {
    const originalTotal = calculateTotalOriginal();
    if (formData.combo_price && originalTotal > 0) {
      return ((originalTotal - formData.combo_price) / originalTotal * 100).toFixed(1);
    }
    return null;
  };

  const impliedDiscount = calculateImpliedDiscount();

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{promotion ? '✏️ Editar Promoção' : '➕ Nova Promoção'}</h2>
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
              placeholder="Ex: Promoção de Verão"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva a promoção"
              className={styles.textarea}
            />
          </div>

          {/* SEÇÃO DE ITENS */}
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <h3>Itens da Promoção</h3>
            </div>

            {/* Seletor de tipo */}
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeButton} ${selectedItemType === 'service' ? styles.active : ''}`}
                onClick={() => {
                  setSelectedItemType('service');
                  setSearchTerm('');
                  setSelectedItemId('');
                  setShowDropdown(false);
                }}
              >
                🧖 Serviços
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${selectedItemType === 'product' ? styles.active : ''}`}
                onClick={() => {
                  setSelectedItemType('product');
                  setSearchTerm('');
                  setSelectedItemId('');
                  setShowDropdown(false);
                }}
              >
                📦 Produtos
              </button>
            </div>

            {/* Campo de busca com dropdown */}
            <div className={styles.searchWrapper} ref={dropdownRef}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder={`Buscar ${selectedItemType === 'service' ? 'serviço' : 'produto'} por nome...`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) {
                      setSelectedItemId('');
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className={styles.clearSearch}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedItemId('');
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown de resultados */}
              {showDropdown && searchTerm && (
                <div className={styles.dropdown}>
                  {loadingItems ? (
                    <div className={styles.dropdownLoading}>
                      <span className={styles.spinner}></span>
                      Carregando...
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className={styles.dropdownEmpty}>
                      Nenhum {selectedItemType === 'service' ? 'serviço' : 'produto'} encontrado
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <div
                        key={item.id}
                        className={`${styles.dropdownItem} ${selectedItemId === item.id ? styles.selected : ''}`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className={styles.dropdownItemName}>
                          <span className={styles.dropdownItemType}>
                            {item.type === 'service' ? '🧖' : '📦'}
                          </span>
                          {item.name}
                        </div>
                        <div className={styles.dropdownItemDetails}>
                          <span className={styles.dropdownItemPrice}>
                            {formatCurrency(item.price)}
                          </span>
                          {item.type === 'product' && item.stock !== undefined && (
                            <span className={`${styles.dropdownItemBadge} ${styles.stockBadge}`}>
                              Estoque: {item.stock}
                            </span>
                          )}
                          {item.type === 'service' && item.duration && (
                            <span className={`${styles.dropdownItemBadge} ${styles.durationBadge}`}>
                              {item.duration}min
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Controles de quantidade e adição */}
            {selectedItemId && (
              <div className={styles.addItemControls}>
                <div className={styles.quantityControl}>
                  <label htmlFor="itemQuantity">Quantidade:</label>
                  <input
                    type="number"
                    id="itemQuantity"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    className={styles.quantityInput}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className={styles.addButton}
                >
                  ➕ Adicionar à Promoção
                </button>
              </div>
            )}

            {/* Lista de itens adicionados */}
            {items.length === 0 ? (
              <p className={styles.emptyItems}>
                Nenhum item adicionado. Busque e selecione itens acima.
              </p>
            ) : (
              <>
                <div className={styles.selectedItemsList}>
                  <h4>Itens Selecionados ({items.length})</h4>
                  {items.map((item, index) => (
                    <div key={index} className={styles.selectedItem}>
                      <div className={styles.selectedItemInfo}>
                        <span className={styles.selectedItemType}>
                          {item.item_type === 'service' ? '🧖' : '📦'}
                        </span>
                        <span className={styles.selectedItemName}>{item.name}</span>
                      </div>
                      <div className={styles.selectedItemDetails}>
                        {editingItemIndex === index ? (
                          <>
                            <input
                              type="number"
                              min="1"
                              value={editingQuantity}
                              onChange={(e) => setEditingQuantity(Number(e.target.value))}
                              className={styles.quantityEditInput}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuantity(index)}
                              className={styles.saveQuantityButton}
                              title="Salvar quantidade"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItemIndex(null)}
                              className={styles.cancelQuantityButton}
                              title="Cancelar"
                            >
                              ✗
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={styles.selectedItemPrice}>
                              {formatCurrency(item.original_price)} × {item.quantity || 1}
                            </span>
                            <span className={styles.selectedItemTotal}>
                              = {formatCurrency((item.original_price) * (item.quantity || 1))}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEditQuantity(index, item.quantity || 1)}
                              className={styles.editQuantityButton}
                              title="Editar quantidade"
                            >
                              ✏️
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className={styles.removeItemButton}
                          title="Remover item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Seção de Desconto e Resumo */}
          <div className={styles.discountSummarySection}>
            <h3>Desconto e Resumo</h3>
            
            <div className={styles.discountRow}>
              <div className={styles.formGroup}>
                <label htmlFor="discount_percentage">Desconto (%)</label>
                <input
                  type="number"
                  id="discount_percentage"
                  name="discount_percentage"
                  value={formData.discount_percentage === null ? '' : formData.discount_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="combo_price">Preço do Combo (opcional)</label>
                <input
                  type="number"
                  id="combo_price"
                  name="combo_price"
                  value={formData.combo_price === null ? '' : formData.combo_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="R$ 0,00"
                  className={styles.input}
                />
              </div>
            </div>

            {/* Resumo da promoção */}
            <div className={styles.promotionSummary}>
              <div className={styles.summaryRow}>
                <span>Total original:</span>
                <strong>{formatCurrency(calculateTotalOriginal())}</strong>
              </div>
              
              {impliedDiscount && formData.combo_price && (
                <div className={styles.summaryRow}>
                  <span>Desconto implícito:</span>
                  <strong className={styles.discountAmount}>{impliedDiscount}%</strong>
                </div>
              )}
              
              {!formData.combo_price && formData.discount_percentage ? (
                <div className={styles.summaryRow}>
                  <span>Desconto ({formData.discount_percentage}%):</span>
                  <strong className={styles.discountAmount}>
                    -{formatCurrency(calculateTotalOriginal() * (formData.discount_percentage / 100))}
                  </strong>
                </div>
              ) : null}
              
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total com desconto:</span>
                <strong>{formatCurrency(calculateDiscountedTotal())}</strong>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Salvando...' : (promotion ? 'Salvar Alterações' : 'Criar Promoção')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};