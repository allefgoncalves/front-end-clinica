// src/features/products/components/ProductTable/ProductTable.tsx
import React, { useState } from 'react';
import { Product, SortField, SortOrder } from '../../types/product.types';
import styles from './ProductTable.module.css';

interface ProductTableProps {
  products: Product[];
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleStatus: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, data: Partial<Product>) => Promise<void>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onSort,
  sortField,
  sortOrder,
  onToggleStatus,
  onEdit,
  onDelete,
  onSaveEdit,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSortClick = (field: SortField) => {
    console.log('Clicou para ordenar:', field);
    onSort(field);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Product) => {
    const value = field === 'price' || field === 'stock' ? Number(e.target.value) : e.target.value;
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th 
                onClick={() => handleSortClick('name')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>NOME</span>
                  <span className={styles.sortIcon}>{getSortIcon('name')}</span>
                </div>
              </th>
              <th className={styles.th}>DESCRIÇÃO</th>
              <th 
                onClick={() => handleSortClick('price')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>PREÇO</span>
                  <span className={styles.sortIcon}>{getSortIcon('price')}</span>
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('stock')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>ESTOQUE</span>
                  <span className={styles.sortIcon}>{getSortIcon('stock')}</span>
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('expiration_date')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>VALIDADE</span>
                  <span className={styles.sortIcon}>{getSortIcon('expiration_date')}</span>
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
              {products.map((product) => (
                <tr key={product.id} className={styles.tableRow}>
                  <td className={styles.td}>
                    {editingId === product.id ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => handleEditChange(e, 'name')}
                        className={styles.editInput}
                        autoFocus
                      />
                    ) : (
                      <div className={styles.productName}>
                        <div>{product.name}</div>
                        {product.batch && <div className={styles.batch}>Lote: {product.batch}</div>}
                      </div>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.productDescription}>
                      {product.description || '—'}
                    </div>
                  </td>
                  <td className={styles.td}>
                    {editingId === product.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price || 0}
                        onChange={(e) => handleEditChange(e, 'price')}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.priceCell}>
                        R$ {product.price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editForm.stock || 0}
                        onChange={(e) => handleEditChange(e, 'stock')}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.stockCell}>{product.stock}</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {product.expiration_date ? (
                      <div className={styles.expiryCell}>
                        {new Date(product.expiration_date).toLocaleDateString('pt-BR')}
                        {(() => {
                          const today = new Date();
                          const expiry = new Date(product.expiration_date);
                          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          
                          if (daysUntilExpiry < 0) {
                            return <span className={styles.expiryBadgeExpired}>Vencido</span>;
                          } else if (daysUntilExpiry <= 30) {
                            return <span className={styles.expiryBadgeWarning}>Vence em {daysUntilExpiry} dias</span>;
                          }
                        })()}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={styles.td}>
                    <button
                      className={`${styles.statusBadge} ${
                        product.active ? styles.active : styles.inactive
                      }`}
                      onClick={() => onToggleStatus(product)}
                    >
                      {product.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      {editingId === product.id ? (
                        <>
                          <button onClick={() => saveEdit(product.id)} className={styles.saveBtn} title="Salvar">
                            ✓
                          </button>
                          <button onClick={cancelEdit} className={styles.cancelBtn} title="Cancelar">
                            ✗
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(product)} className={styles.editBtn} title="Editar rápido">
                            ✏️
                          </button>
                          <button onClick={() => onEdit(product)} className={styles.editBtn} title="Editar completo">
                            📝
                          </button>
                          <button onClick={() => onDelete(product.id)} className={styles.deleteBtn} title="Excluir">
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};