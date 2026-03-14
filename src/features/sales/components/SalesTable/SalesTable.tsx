// src/features/sales/components/SalesTable/SalesTable.tsx
import React from 'react';
import { Sale, SaleStatus, PaymentStatus, SortField, SortOrder } from '../../types/sales.types';
import { SaleHistory } from '../SaleHistory/SaleHistory';
import styles from './SalesTable.module.css';

interface SalesTableProps {
  sales: Sale[];
  selectedSales: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onUpdateStatus: (id: string, status: SaleStatus) => Promise<void>;
  onUpdatePaymentStatus: (id: string, paymentStatus: PaymentStatus) => Promise<void>;
  onSendReceipt: (sale: Sale) => Promise<void>;
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  loading?: boolean; // Adicionado como opcional
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  selectedSales,
  onToggleSelect,
  onToggleSelectAll,
  expandedId,
  onToggleExpand,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onSendReceipt,
  onSort,
  sortField,
  sortOrder,
  loading = false // Valor padrão
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: SaleStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '💰';
      case 'separated': return '🔧';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '⚪';
    }
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '✅';
      case 'refunded': return '↩️';
      default: return '⚪';
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSortClick = (field: SortField) => {
    onSort(field);
  };

  const allSelected = sales.length > 0 && selectedSales.size === sales.length;
  const someSelected = selectedSales.size > 0 && selectedSales.size < sales.length;

  // Se estiver carregando, não mostra nada
  if (loading) {
    return null;
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.thCheckbox}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={onToggleSelectAll}
                />
              </th>
              <th className={styles.thExpand}></th>
              <th 
                onClick={() => handleSortClick('created_at')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>DATA/HORA</span>
                  <span className={styles.sortIcon}>{getSortIcon('created_at')}</span>
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('user_name')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>CLIENTE</span>
                  <span className={styles.sortIcon}>{getSortIcon('user_name')}</span>
                </div>
              </th>
              <th className={styles.th}>ITENS</th>
              <th 
                onClick={() => handleSortClick('total')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>TOTAL</span>
                  <span className={styles.sortIcon}>{getSortIcon('total')}</span>
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
              <th 
                onClick={() => handleSortClick('payment_status')} 
                className={`${styles.th} ${styles.sortable}`}
              >
                <div className={styles.thContent}>
                  <span>PAGAMENTO</span>
                  <span className={styles.sortIcon}>{getSortIcon('payment_status')}</span>
                </div>
              </th>
              <th className={styles.th}>AÇÕES</th>
            </tr>
          </thead>
        </table>
        
        <div className={styles.tableBody}>
          <table className={styles.table}>
            <tbody>
              {sales.map((sale) => {
                const isExpanded = expandedId === sale.id;
                const isSelected = selectedSales.has(sale.id);
                
                return (
                  <React.Fragment key={sale.id}>
                    <tr className={`${styles.tableRow} ${isSelected ? styles.selected : ''}`}>
                      <td className={styles.tdCheckbox}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(sale.id)}
                        />
                      </td>
                      <td className={styles.tdExpand}>
                        <button
                          className={styles.expandButton}
                          onClick={() => onToggleExpand(sale.id)}
                          title={isExpanded ? 'Recolher histórico' : 'Ver histórico'}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className={styles.td}>{formatDate(sale.created_at)}</td>
                      <td className={styles.td}>
                        <div className={styles.clientInfo}>
                          <div>{sale.user_name}</div>
                          <div className={styles.clientEmail}>{sale.user_email}</div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.itemsCount}>
                          {sale.items?.length || 0} {sale.items?.length === 1 ? 'item' : 'itens'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.total}>
                          {formatCurrency(sale.total)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.status} ${styles[sale.status]}`}>
                          {getStatusIcon(sale.status)} {sale.status}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.paymentStatus} ${styles[sale.payment_status]}`}>
                          {getPaymentStatusIcon(sale.payment_status)} {sale.payment_status}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          {/* Botão de comprovante - sempre visível */}
                          <button
                            onClick={() => onSendReceipt(sale)}
                            className={styles.receiptButton}
                            title="Enviar comprovante"
                          >
                            📄
                          </button>
                          
                          {/* Confirmar pagamento (se pendente) */}
                          {sale.payment_status === 'pending' && (
                            <button
                              onClick={() => onUpdatePaymentStatus(sale.id, 'paid')}
                              className={styles.payButton}
                              title="Confirmar pagamento"
                            >
                              💰
                            </button>
                          )}
                          
                          {/* Marcar como separado (se pago e não separado) */}
                          {sale.payment_status === 'paid' && sale.status === 'pending' && (
                            <button
                              onClick={() => onUpdateStatus(sale.id, 'separated')}
                              className={styles.separateButton}
                              title="Marcar como separado"
                            >
                              🔧
                            </button>
                          )}
                          
                          {/* Marcar como entregue (se separado) */}
                          {sale.status === 'separated' && (
                            <button
                              onClick={() => onUpdateStatus(sale.id, 'delivered')}
                              className={styles.deliverButton}
                              title="Marcar como entregue"
                            >
                              ✅
                            </button>
                          )}
                          
                          {/* Reembolsar (se pago) */}
                          {sale.payment_status === 'paid' && (
                            <button
                              onClick={() => onUpdatePaymentStatus(sale.id, 'refunded')}
                              className={styles.payButton}
                              title="Reembolsar"
                              style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
                            >
                              ↩️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={9} className={styles.expandedContent}>
                          <SaleHistory sale={sale} />
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
      
      {sales.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma venda encontrada</p>
        </div>
      )}
    </div>
  );
};