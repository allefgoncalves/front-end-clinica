// src/features/promotions/components/PromotionsTable/PromotionsTable.tsx
import React, { useState } from 'react';
import { Promotion, SortField, SortOrder } from '../../types/promotion.types';
import styles from './PromotionsTable.module.css';

interface PromotionsTableProps {
  promotions: Promotion[];
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleStatus: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, data: Partial<Promotion>) => Promise<void>;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

export const PromotionsTable: React.FC<PromotionsTableProps> = ({
  promotions,
  onSort,
  sortField,
  sortOrder,
  onToggleStatus,
  onEdit,
  onDelete,
  onSaveEdit,
  expandedId,
  onToggleExpand
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Promotion>>({});

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSortClick = (field: SortField) => {
    onSort(field);
  };

  const startEdit = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setEditForm({
      title: promotion.title,
      discount_percentage: promotion.discount_percentage,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    await onSaveEdit(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Promotion) => {
    const value = field === 'discount_percentage' ? Number(e.target.value) : e.target.value;
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isPromotionValid = (promotion: Promotion) => {
    const now = new Date();
    if (promotion.valid_from && new Date(promotion.valid_from) > now) return false;
    if (promotion.valid_until && new Date(promotion.valid_until) < now) return false;
    return promotion.active;
  };

  const calculateTotalOriginal = (items: Promotion['items']) => {
    return items.reduce((sum, item) => sum + (item.original_price * (item.quantity || 1)), 0);
  };

  const calculateDiscountedTotal = (items: Promotion['items'], discount: number) => {
    const total = calculateTotalOriginal(items);
    return total * (1 - discount / 100);
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.thExpand}></th>
              <th 
                onClick={() => handleSortClick('title')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>TÍTULO</span>
                  <span className={styles.sortIcon}>{getSortIcon('title')}</span>
                </div>
              </th>
              <th className={styles.th}>DESCRIÇÃO</th>
              <th 
                onClick={() => handleSortClick('discount_percentage')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>DESCONTO</span>
                  <span className={styles.sortIcon}>{getSortIcon('discount_percentage')}</span>
                </div>
              </th>
              <th className={styles.th}>ITENS</th>
              <th className={styles.th}>TOTAL</th>
              <th 
                onClick={() => handleSortClick('valid_from')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>VÁLIDO DE</span>
                  <span className={styles.sortIcon}>{getSortIcon('valid_from')}</span>
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('valid_until')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>VÁLIDO ATÉ</span>
                  <span className={styles.sortIcon}>{getSortIcon('valid_until')}</span>
                </div>
              </th>
              <th className={styles.th}>STATUS</th>
              <th className={styles.th}>AÇÕES</th>
            </tr>
          </thead>
        </table>
        
        <div className={styles.tableBody}>
          <table className={styles.table}>
            <tbody>
              {promotions.map((promotion) => {
                const isValid = isPromotionValid(promotion);
                const isExpanded = expandedId === promotion.id;
                const totalOriginal = calculateTotalOriginal(promotion.items);
                const totalDiscounted = calculateDiscountedTotal(promotion.items, promotion.discount_percentage);
                
                return (
                  <React.Fragment key={promotion.id}>
                    <tr className={styles.tableRow}>
                      <td className={styles.tdExpand}>
                        <button
                          className={styles.expandButton}
                          onClick={() => onToggleExpand(promotion.id)}
                          title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className={styles.td}>
                        {editingId === promotion.id ? (
                          <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={(e) => handleEditChange(e, 'title')}
                            className={styles.editInput}
                            autoFocus
                          />
                        ) : (
                          <div className={styles.promotionTitle}>
                            {promotion.title}
                          </div>
                        )}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.promotionDescription}>
                          {promotion.description.length > 50 
                            ? `${promotion.description.substring(0, 50)}...` 
                            : promotion.description || '—'}
                        </div>
                      </td>
                      <td className={styles.td}>
                        {editingId === promotion.id ? (
                          <input
                            type="number"
                            value={editForm.discount_percentage || 0}
                            onChange={(e) => handleEditChange(e, 'discount_percentage')}
                            className={styles.editInput}
                            min="0"
                            max="100"
                            step="1"
                          />
                        ) : (
                          <span className={styles.discountCell}>
                            {promotion.discount_percentage}%
                          </span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <span className={styles.itemsCount}>
                          {promotion.items.length} {promotion.items.length === 1 ? 'item' : 'itens'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.totalCell}>
                          <span className={styles.originalTotal}>
                            {formatCurrency(totalOriginal)}
                          </span>
                          <span className={styles.discountedTotal}>
                            {formatCurrency(totalDiscounted)}
                          </span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        {formatDate(promotion.valid_from)}
                      </td>
                      <td className={styles.td}>
                        {formatDate(promotion.valid_until)}
                      </td>
                      <td className={styles.td}>
                        <button
                          className={`${styles.statusBadge} ${
                            isValid ? styles.active : styles.inactive
                          }`}
                          onClick={() => onToggleStatus(promotion)}
                        >
                          {isValid ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          {editingId === promotion.id ? (
                            <>
                              <button onClick={() => saveEdit(promotion.id)} className={styles.saveBtn} title="Salvar">
                                ✓
                              </button>
                              <button onClick={cancelEdit} className={styles.cancelBtn} title="Cancelar">
                                ✗
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(promotion)} className={styles.editBtn} title="Editar rápido">
                                ✏️
                              </button>
                              <button onClick={() => onEdit(promotion)} className={styles.editBtn} title="Editar completo">
                                📝
                              </button>
                              <button onClick={() => onDelete(promotion.id)} className={styles.deleteBtn} title="Excluir">
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={11} className={styles.expandedContent}>
                          <div className={styles.expandedDetails}>
                            <h4>Itens da Promoção</h4>
                            <div className={styles.expandedItems}>
                              {promotion.items.map((item, index) => (
                                <div key={index} className={styles.expandedItem}>
                                  <div className={styles.expandedItemHeader}>
                                    <span className={styles.expandedItemType}>
                                      {item.item_type === 'service' ? '🧖' : '📦'}
                                    </span>
                                    <span className={styles.expandedItemName}>{item.name}</span>
                                  </div>
                                  <div className={styles.expandedItemDetails}>
                                    <div className={styles.expandedItemPrice}>
                                      <span>Preço unitário:</span>
                                      <strong>{formatCurrency(item.original_price)}</strong>
                                    </div>
                                    <div className={styles.expandedItemQuantity}>
                                      <span>Quantidade:</span>
                                      <strong>{item.quantity || 1}x</strong>
                                    </div>
                                    <div className={styles.expandedItemSubtotal}>
                                      <span>Subtotal:</span>
                                      <strong>{formatCurrency((item.original_price) * (item.quantity || 1))}</strong>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className={styles.expandedSummary}>
                              <div className={styles.expandedSummaryRow}>
                                <span>Total original:</span>
                                <strong>{formatCurrency(totalOriginal)}</strong>
                              </div>
                              <div className={styles.expandedSummaryRow}>
                                <span>Desconto ({promotion.discount_percentage}%):</span>
                                <strong className={styles.expandedDiscount}>
                                  -{formatCurrency(totalOriginal * promotion.discount_percentage / 100)}
                                </strong>
                              </div>
                              <div className={`${styles.expandedSummaryRow} ${styles.expandedTotal}`}>
                                <span>Total com desconto:</span>
                                <strong>{formatCurrency(totalDiscounted)}</strong>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {promotions.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma promoção encontrada</p>
        </div>
      )}
    </div>
  );
};