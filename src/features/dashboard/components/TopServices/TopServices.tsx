// src/features/dashboard/components/TopServices/TopServices.tsx
import React from 'react';
import { TopItem } from '../../types/dashboard.types';
import styles from './TopServices.module.css';

interface TopServicesProps {
  services: TopItem[];
}

export const TopServices: React.FC<TopServicesProps> = ({ services }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h3>🧖 Top 5 Serviços</h3>
      <div className={styles.list}>
        {services.map((service, index) => (
          <div key={service.id} className={styles.item}>
            <div className={styles.rank}>#{index + 1}</div>
            <div className={styles.info}>
              <div className={styles.name}>{service.name}</div>
              <div className={styles.stats}>
                <span className={styles.quantity}>{service.quantity} vendidos</span>
                <span className={styles.revenue}>{formatCurrency(service.revenue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};