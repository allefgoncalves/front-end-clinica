// src/features/sales/components/SalesDashboard/SalesDashboard.tsx
import React from 'react';
import { SalesSummary } from '../../types/sales.types';
import styles from './SalesDashboard.module.css';

interface SalesDashboardProps {
  summary: SalesSummary | null;
  loading: boolean;
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
  dateRange: { startDate: string; endDate: string };
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  summary,
  loading,
  onDateRangeChange,
  dateRange
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
    onDateRangeChange({
      ...dateRange,
      [field]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={styles.empty}>
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Seletor de período */}
      <div className={styles.dateRange}>
        <div className={styles.dateInput}>
          <label>De</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange(e, 'startDate')}
          />
        </div>
        <div className={styles.dateInput}>
          <label>Até</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange(e, 'endDate')}
          />
        </div>
      </div>

      {/* Cards de resumo */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Faturamento Total</span>
            <span className={styles.cardValue}>{formatCurrency(summary.total_revenue)}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📦</div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Total de Vendas</span>
            <span className={styles.cardValue}>{summary.total_sales}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🎫</div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Ticket Médio</span>
            <span className={styles.cardValue}>{formatCurrency(summary.average_ticket)}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>⏳</div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Pagamentos Pendentes</span>
            <span className={styles.cardValue}>{summary.pending_payment_count}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🔧</div>
          <div className={styles.cardInfo}>
            <span className={styles.cardLabel}>Aguardando Separação</span>
            <span className={styles.cardValue}>{summary.pending_separation_count}</span>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className={styles.statusSection}>
        <h3>📊 Status das Vendas</h3>
        <div className={styles.statusGrid}>
          {Object.entries(summary.sales_by_status).map(([status, count]) => (
            <div key={status} className={styles.statusItem}>
              <span className={styles.statusLabel}>
                {status === 'pending' && '⏳ Pendente'}
                {status === 'paid' && '💰 Pago'}
                {status === 'separated' && '🔧 Separado'}
                {status === 'delivered' && '✅ Entregue'}
                {status === 'cancelled' && '❌ Cancelado'}
              </span>
              <span className={styles.statusValue}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.statusSection}>
        <h3>💳 Status de Pagamento</h3>
        <div className={styles.statusGrid}>
          {Object.entries(summary.payment_by_status).map(([status, count]) => (
            <div key={status} className={styles.statusItem}>
              <span className={styles.statusLabel}>
                {status === 'pending' && '⏳ Pendente'}
                {status === 'paid' && '✅ Pago'}
                {status === 'refunded' && '↩️ Reembolsado'}
              </span>
              <span className={styles.statusValue}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};