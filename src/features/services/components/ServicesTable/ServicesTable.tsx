// src/features/services/components/ServicesTable/ServicesTable.tsx
import React, { useState } from 'react';
import { Service, SortField, SortOrder } from '../../types/service.types';
import styles from './ServicesTable.module.css';

interface ServicesTableProps {
  services: Service[];
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleStatus: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, data: Partial<Service>) => Promise<void>;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onSort,
  sortField,
  sortOrder,
  onToggleStatus,
  onEdit,
  onDelete,
  onSaveEdit,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSortClick = (field: SortField) => {
    onSort(field);
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes,
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Service) => {
    const value = field === 'price' || field === 'duration_minutes' ? Number(e.target.value) : e.target.value;
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
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
                onClick={() => handleSortClick('duration')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>DURAÇÃO</span>
                  <span className={styles.sortIcon}>{getSortIcon('duration')}</span>
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('price')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>PREÇO</span>
                  <span className={styles.sortIcon}>{getSortIcon('price')}</span>
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
              {services.map((service) => (
                <tr key={service.id} className={styles.tableRow}>
                  <td className={styles.td}>
                    {editingId === service.id ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => handleEditChange(e, 'name')}
                        className={styles.editInput}
                        autoFocus
                      />
                    ) : (
                      <div className={styles.serviceName}>
                        <div>{service.name}</div>
                      </div>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.serviceDescription}>
                      {service.description || '—'}
                    </div>
                  </td>
                  <td className={styles.td}>
                    {editingId === service.id ? (
                      <input
                        type="number"
                        value={editForm.duration_minutes || 0}
                        onChange={(e) => handleEditChange(e, 'duration_minutes')}
                        className={styles.editInput}
                        min="5"
                        step="5"
                      />
                    ) : (
                      <span className={styles.durationCell}>
                        {formatDuration(service.duration_minutes)}
                      </span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {editingId === service.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price || 0}
                        onChange={(e) => handleEditChange(e, 'price')}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.priceCell}>
                        R$ {service.price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <button
                      className={`${styles.statusBadge} ${
                        service.active ? styles.active : styles.inactive
                      }`}
                      onClick={() => onToggleStatus(service)}
                    >
                      {service.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      {editingId === service.id ? (
                        <>
                          <button onClick={() => saveEdit(service.id)} className={styles.saveBtn} title="Salvar">
                            ✓
                          </button>
                          <button onClick={cancelEdit} className={styles.cancelBtn} title="Cancelar">
                            ✗
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(service)} className={styles.editBtn} title="Editar rápido">
                            ✏️
                          </button>
                          <button onClick={() => onEdit(service)} className={styles.editBtn} title="Editar completo">
                            📝
                          </button>
                          <button onClick={() => onDelete(service.id)} className={styles.deleteBtn} title="Excluir">
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