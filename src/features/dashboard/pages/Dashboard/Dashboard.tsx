// src/features/dashboard/pages/Dashboard/Dashboard.tsx
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardData } from '../../types/dashboard.types';
import { KPICards } from '../../components/KPICards';
import { SalesChart } from '../../components/SalesChart';
import { StatusPieChart } from '../../components/StatusPieChart';
import { TopProducts } from '../../components/TopProducts';
import { TopServices } from '../../components/TopServices';
import { PromotionsWidget } from '../../components/PromotionsWidget';
import { UpcomingAppointments } from '../../components/UpcomingAppointments';
import { AbandonedCarts } from '../../components/AbandonedCarts';
import { LowStockAlert } from '../../components/LowStockAlert';
import { ExpiringProducts } from '../../components/ExpiringProducts';
import styles from './Dashboard.module.css';

// Dados mock para testar o gráfico
const mockData: DashboardData = {
  kpis: {
    sales_today: { count: 8, revenue: 1250.50 },
    appointments_today: 5,
    low_stock_count: 3,
    expiring_soon_count: 2,
    monthly_revenue: 15000.00,
  },
  charts: {
    sales_by_day: [
      { date: '2024-01-01', count: 5, revenue: 250.00 },
      { date: '2024-01-02', count: 8, revenue: 400.00 },
      { date: '2024-01-03', count: 12, revenue: 600.00 },
      { date: '2024-01-04', count: 7, revenue: 350.00 },
      { date: '2024-01-05', count: 15, revenue: 750.00 },
      { date: '2024-01-06', count: 10, revenue: 500.00 },
      { date: '2024-01-07', count: 9, revenue: 450.00 },
    ],
    sales_by_status: { pending: 5, paid: 25, separated: 3, delivered: 18, cancelled: 2 },
    top_products: [
      { id: '1', name: 'Óleo Essencial Lavanda', quantity: 15, revenue: 225.00 },
      { id: '2', name: 'Creme Hidratante', quantity: 12, revenue: 180.00 },
      { id: '3', name: 'Shampoo Natural', quantity: 8, revenue: 120.00 },
    ],
    top_services: [
      { id: '1', name: 'Massagem Relaxante', quantity: 20, revenue: 1000.00 },
      { id: '2', name: 'Limpeza de Pele', quantity: 15, revenue: 750.00 },
      { id: '3', name: 'Tratamento Capilar', quantity: 10, revenue: 500.00 },
    ],
  },
  lists: {
    upcoming_appointments: [
      { id: '1', time: '14:00', client: 'Maria Silva', service: 'Massagem Relaxante', status: 'confirmed' },
      { id: '2', time: '15:30', client: 'João Santos', service: 'Limpeza de Pele', status: 'confirmed' },
    ],
    abandoned_carts: [
      { client: 'Ana Costa', items: 3, total: 85.00, cart_id: 'cart_001' },
      { client: 'Pedro Lima', items: 2, total: 45.00, cart_id: 'cart_002' },
    ],
    low_stock_products: [
      { id: '1', name: 'Óleo Essencial Lavanda', stock: 5, min_stock: 10 },
      { id: '2', name: 'Creme Hidratante', stock: 3, min_stock: 8 },
    ],
    expiring_products: [
      { id: '1', name: 'Loção Corporal', expiry_date: '2024-01-15', days_left: 3, stock: 12 },
      { id: '2', name: 'Shampoo', expiry_date: '2024-01-20', days_left: 8, stock: 6 },
    ],
  },
  promotions: {
    starting_soon: [],
    ending_soon: [],
    ending_today: [],
  },
  alerts: [
    { type: 'low_stock', message: 'Óleo Essencial Lavanda com apenas 5 unidades', link: '/products', severity: 'medium' },
    { type: 'expiring', message: 'Creme Corporal vence em 3 dias', link: '/products', severity: 'high' },
  ],
};

const Dashboard: React.FC = () => {
  const { data, loading, error, period, setPeriod } = useDashboard();

  // Usar dados mock se não houver dados da API
  const displayData = data || mockData;

  if (loading && !data) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={styles.error}>
        <p>❌ {error || 'Erro ao carregar dados'}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Dashboard</h1>
        <div className={styles.periodSelector}>
          <button
            className={period === 'day' ? styles.active : ''}
            onClick={() => setPeriod('day')}
          >
            Hoje
          </button>
          <button
            className={period === 'week' ? styles.active : ''}
            onClick={() => setPeriod('week')}
          >
            Semana
          </button>
          <button
            className={period === 'month' ? styles.active : ''}
            onClick={() => setPeriod('month')}
          >
            Mês
          </button>
        </div>
      </div>

      <KPICards data={displayData.kpis} />

      <PromotionsWidget
        starting={displayData.promotions.starting_soon}
        endingSoon={displayData.promotions.ending_soon}
        endingToday={displayData.promotions.ending_today}
      />

      <div className={styles.chartsGrid}>
        <SalesChart data={displayData.charts.sales_by_day} />
        <StatusPieChart data={displayData.charts.sales_by_status} />
      </div>

      <div className={styles.topGrid}>
        <TopProducts products={displayData.charts.top_products} />
        <TopServices services={displayData.charts.top_services} />
      </div>

      <div className={styles.listsGrid}>
        <UpcomingAppointments appointments={displayData.lists.upcoming_appointments} />
        <AbandonedCarts carts={displayData.lists.abandoned_carts} />
        <LowStockAlert products={displayData.lists.low_stock_products} />
        <ExpiringProducts products={displayData.lists.expiring_products} />
      </div>
    </div>
  );
};

export default Dashboard;