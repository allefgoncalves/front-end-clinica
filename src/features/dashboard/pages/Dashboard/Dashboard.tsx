// src/features/dashboard/pages/Dashboard/Dashboard.tsx
import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
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

const Dashboard: React.FC = () => {
  const { data, loading, error, period, setPeriod } = useDashboard();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
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

      <KPICards data={data.kpis} />

      <PromotionsWidget
        starting={data.promotions.starting_soon}
        endingSoon={data.promotions.ending_soon}
        endingToday={data.promotions.ending_today}
      />

      <div className={styles.chartsGrid}>
        <SalesChart data={data.charts.sales_by_day} />
        <StatusPieChart data={data.charts.sales_by_status} />
      </div>

      <div className={styles.topGrid}>
        <TopProducts products={data.charts.top_products} />
        <TopServices services={data.charts.top_services} />
      </div>

      <div className={styles.listsGrid}>
        <UpcomingAppointments appointments={data.lists.upcoming_appointments} />
        <AbandonedCarts carts={data.lists.abandoned_carts} />
        <LowStockAlert products={data.lists.low_stock_products} />
        <ExpiringProducts products={data.lists.expiring_products} />
      </div>

      {data.alerts.length > 0 && (
        <div className={styles.alerts}>
          {data.alerts.map((alert, index) => (
            <div key={index} className={`${styles.alert} ${styles[alert.severity]}`}>
              <span className={styles.alertIcon}>
                {alert.type === 'stock' && '⚠️'}
                {alert.type === 'expiry' && '⏳'}
                {alert.type === 'promotion' && '🏷️'}
              </span>
              <span className={styles.alertMessage}>{alert.message}</span>
              <a href={alert.link} className={styles.alertLink}>Ver</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;