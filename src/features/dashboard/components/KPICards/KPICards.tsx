// src/features/dashboard/components/KPICards/KPICards.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardData } from '../../types/dashboard.types';
import styles from './KPICards.module.css';

interface KPICardsProps {
  data: DashboardData['kpis'];
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const cards = [
    {
      label: 'Vendas Hoje',
      value: `${data.sales_today.count} | ${formatCurrency(data.sales_today.revenue)}`,
      icon: '💰',
      link: '/sales',
      color: 'var(--success)',
      alert: false
    },
    {
      label: 'Agendamentos Hoje',
      value: data.appointments_today,
      icon: '📅',
      link: '/appointments',
      color: 'var(--info)',
      alert: data.appointments_today > 0
    },
    {
      label: 'Estoque Baixo',
      value: data.low_stock_count,
      icon: '⚠️',
      link: '/products?filter=low_stock',
      color: 'var(--warning)',
      alert: data.low_stock_count > 0,
      alertMessage: `${data.low_stock_count} produto(s) precisam de reposição`
    },
    {
      label: 'Produtos a Vencer',
      value: data.expiring_soon_count,
      icon: '⏳',
      link: '/products?filter=expiring',
      color: 'var(--warning)',
      alert: data.expiring_soon_count > 0,
      alertMessage: `${data.expiring_soon_count} produto(s) vencem em até 30 dias`
    },
    {
      label: 'Receita Mensal',
      value: formatCurrency(data.monthly_revenue),
      icon: '📊',
      link: '/sales',
      color: 'var(--accent)',
      alert: false
    }
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card, index) => (
        <Link to={card.link} key={index} className={styles.card}>
          <div className={styles.cardIcon} style={{ backgroundColor: card.color + '20', color: card.color }}>
            {card.icon}
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>{card.label}</div>
            <div className={styles.cardValue}>{card.value}</div>
            {card.alert && card.alertMessage && (
              <div className={styles.cardAlert}>{card.alertMessage}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};