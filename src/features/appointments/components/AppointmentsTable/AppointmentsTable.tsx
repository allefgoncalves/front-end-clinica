// src/features/appointments/components/AppointmentsTable/AppointmentsTable.tsx
import React from 'react';
import { Appointment, SortField, SortOrder } from '../../types/appointment.types';
import styles from './AppointmentsTable.module.css';

interface AppointmentsTableProps {
  appointments: Appointment[];
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onCancel: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onEdit: (appointment: Appointment) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onSort,
  sortField,
  sortOrder,
  onCancel,
  onDelete,
  onEdit,
  expandedId,
  onToggleExpand
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSortClick = (field: SortField) => {
    onSort(field);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Confirmado', className: styles.confirmed, icon: '✅' };
      case 'cancelled':
        return { text: 'Cancelado', className: styles.cancelled, icon: '❌' };
      case 'completed':
        return { text: 'Concluído', className: styles.completed, icon: '✓' };
      case 'no_show':
        return { text: 'Não compareceu', className: styles.noShow, icon: '⚠️' };
      default:
        return { text: status, className: '', icon: '' };
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.thExpand}></th>
              <th className={styles.th}>CLIENTE</th>
              <th className={styles.th}>CONTATO</th>
              <th 
                onClick={() => handleSortClick('scheduled_date')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>DATA/HORA</span>
                  <span className={styles.sortIcon}>{getSortIcon('scheduled_date')}</span>
                </div>
              </th>
              <th className={styles.th}>SERVIÇOS</th>
              <th 
                onClick={() => handleSortClick('total_price')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>TOTAL</span>
                  <span className={styles.sortIcon}>{getSortIcon('total_price')}</span>
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('status')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>STATUS</span>
                  <span className={styles.sortIcon}>{getSortIcon('status')}</span>
                </div>
              </th>
              <th className={styles.th}>MASSAGISTA</th>
              <th className={styles.th}>AÇÕES</th>
            </tr>
          </thead>
        </table>
        
        <div className={styles.tableBody}>
          <table className={styles.table}>
            <tbody>
              {appointments.map((appointment) => {
                const statusInfo = getStatusInfo(appointment.status);
                const isExpanded = expandedId === appointment.id;
                
                return (
                  <React.Fragment key={appointment.id}>
                    <tr className={styles.tableRow}>
                      <td className={styles.tdExpand}>
                        <button
                          className={styles.expandButton}
                          onClick={() => onToggleExpand(appointment.id)}
                          title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className={styles.td}>{appointment.user_name}</td>
                      <td className={styles.td}>
                        <div className={styles.contactInfo}>
                          <div>{appointment.user_email}</div>
                          {appointment.user_phone && <div className={styles.phone}>{appointment.user_phone}</div>}
                        </div>
                      </td>
                      <td className={styles.td}>{formatDate(appointment.scheduled_date)}</td>
                      <td className={styles.td}>
                        <span className={styles.servicesCount}>
                          {appointment.services.length} {appointment.services.length === 1 ? 'serviço' : 'serviços'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.total}>
                          {formatCurrency(appointment.total_price)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.status} ${statusInfo.className}`}>
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                      </td>
                      <td className={styles.td}>
                        {appointment.massagista_name || '—'}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button
                            onClick={() => onEdit(appointment)}
                            className={styles.editBtn}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          {appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => onCancel(appointment)}
                              className={styles.cancelBtn}
                              title="Cancelar"
                            >
                              ❌
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(appointment.id)}
                            className={styles.deleteBtn}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={9} className={styles.expandedContent}>
                          <div className={styles.expandedDetails}>
                            <h4>📋 Detalhes do Agendamento</h4>
                            <div className={styles.expandedGrid}>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandedLabel}>Cliente:</span>
                                <span className={styles.expandedValue}>{appointment.user_name}</span>
                              </div>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandedLabel}>Email:</span>
                                <span className={styles.expandedValue}>{appointment.user_email}</span>
                              </div>
                              {appointment.user_phone && (
                                <div className={styles.expandedItem}>
                                  <span className={styles.expandedLabel}>Telefone:</span>
                                  <span className={styles.expandedValue}>{appointment.user_phone}</span>
                                </div>
                              )}
                              <div className={styles.expandedItem}>
                                <span className={styles.expandedLabel}>Data/Hora:</span>
                                <span className={styles.expandedValue}>{formatDate(appointment.scheduled_date)}</span>
                              </div>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandedLabel}>Duração total:</span>
                                <span className={styles.expandedValue}>{appointment.total_duration} minutos</span>
                              </div>
                              <div className={styles.expandedItem}>
                                <span className={styles.expandedLabel}>Valor total:</span>
                                <span className={styles.expandedValue}>{formatCurrency(appointment.total_price)}</span>
                              </div>
                              {appointment.massagista_name && (
                                <div className={styles.expandedItem}>
                                  <span className={styles.expandedLabel}>Massagista:</span>
                                  <span className={styles.expandedValue}>{appointment.massagista_name}</span>
                                </div>
                              )}
                              {appointment.notes && (
                                <div className={styles.expandedItemFull}>
                                  <span className={styles.expandedLabel}>Observações:</span>
                                  <span className={styles.expandedValue}>{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                            
                            <h5>🧖 Serviços Agendados</h5>
                            <div className={styles.servicesList}>
                              {appointment.services.map((service, index) => (
                                <div key={index} className={styles.serviceCard}>
                                  <span className={styles.serviceName}>{service.name}</span>
                                  <span className={styles.serviceDuration}>{service.duration_minutes}min</span>
                                  <span className={styles.servicePrice}>{formatCurrency(service.price)}</span>
                                </div>
                              ))}
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
      
      {appointments.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhum agendamento encontrado</p>
        </div>
      )}
    </div>
  );
};