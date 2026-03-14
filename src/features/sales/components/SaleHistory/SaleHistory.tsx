// src/features/sales/components/SaleHistory/SaleHistory.tsx
import React from 'react';
import { Sale } from '../../types/sales.types';
import styles from './SaleHistory.module.css';

interface SaleHistoryProps {
  sale: Sale;
}

export const SaleHistory: React.FC<SaleHistoryProps> = ({ sale }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Pendente';
      case 'paid': return '💰 Pago';
      case 'separated': return '🔧 Separado';
      case 'delivered': return '✅ Entregue';
      case 'cancelled': return '❌ Cancelado';
      default: return status;
    }
  };

  const getPaymentStatusName = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Pendente';
      case 'paid': return '✅ Pago';
      case 'refunded': return '↩️ Reembolsado';
      default: return status;
    }
  };

  // Histórico simulado (em produção, viria da API)
  const mockHistory = [
    {
      id: '1',
      changed_at: sale.created_at,
      changed_by_name: 'Sistema',
      status: 'pending',
      payment_status: 'pending',
      notes: 'Venda criada'
    },
    {
      id: '2',
      changed_at: sale.updated_at,
      changed_by_name: 'Admin',
      status: sale.status,
      payment_status: sale.payment_status,
      notes: sale.notes || 'Status atualizado'
    }
  ];

  return (
    <div className={styles.history}>
      <div className={styles.section}>
        <h4>📋 Detalhes da Venda</h4>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>ID da Venda:</span>
            <span className={styles.detailValue}>{sale.id}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Cliente:</span>
            <span className={styles.detailValue}>{sale.user_name}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Email:</span>
            <span className={styles.detailValue}>{sale.user_email}</span>
          </div>
          {sale.user_phone && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Telefone:</span>
              <span className={styles.detailValue}>{sale.user_phone}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Data da Venda:</span>
            <span className={styles.detailValue}>{formatDate(sale.created_at)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Subtotal:</span>
            <span className={styles.detailValue}>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Desconto:</span>
              <span className={styles.detailValue}>-{formatCurrency(sale.discount)}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Total:</span>
            <span className={styles.detailValueTotal}>{formatCurrency(sale.total)}</span>
          </div>
          {sale.payment_method && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Forma de Pagamento:</span>
              <span className={styles.detailValue}>{sale.payment_method}</span>
            </div>
          )}
          {sale.source && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Origem:</span>
              <span className={styles.detailValue}>{sale.source}</span>
            </div>
          )}
          {sale.estimated_delivery && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Previsão de Entrega:</span>
              <span className={styles.detailValue}>{formatDate(sale.estimated_delivery)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h4>📦 Itens da Venda</h4>
        <div className={styles.itemsList}>
          {sale.items.map((item, index) => (
            <div key={index} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <span className={styles.itemType}>
                  {item.item_type === 'service' ? '🧖' : '📦'}
                </span>
                <span className={styles.itemName}>{item.name}</span>
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemQuantity}>{item.quantity}x</span>
                <span className={styles.itemPrice}>{formatCurrency(item.unit_price)}</span>
                <span className={styles.itemTotal}>{formatCurrency(item.total_price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4>📜 Histórico de Alterações</h4>
        <div className={styles.timeline}>
          {mockHistory.map((entry, index) => (
            <div key={entry.id} className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineDate}>{formatDate(entry.changed_at)}</span>
                  <span className={styles.timelineUser}>{entry.changed_by_name}</span>
                </div>
                <div className={styles.timelineBody}>
                  <span className={styles.timelineStatus}>
                    Status: {getStatusName(entry.status)}
                  </span>
                  <span className={styles.timelinePayment}>
                    Pagamento: {getPaymentStatusName(entry.payment_status || 'pending')}
                  </span>
                  {entry.notes && (
                    <div className={styles.timelineNotes}>{entry.notes}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};