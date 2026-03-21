// src/features/dashboard/components/TopProducts/TopProducts.tsx
import React from 'react';
import { TopItem } from '../../types/dashboard.types';
import styles from './TopProducts.module.css';

interface TopProductsProps {
  products: TopItem[];
}

export const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h3>🏆 Top 5 Produtos</h3>
      <div className={styles.list}>
        {products.map((product, index) => (
          <div key={product.id} className={styles.item}>
            <div className={styles.rank}>#{index + 1}</div>
            <div className={styles.info}>
              <div className={styles.name}>{product.name}</div>
              <div className={styles.stats}>
                <span className={styles.quantity}>{product.quantity} vendidos</span>
                <span className={styles.revenue}>{formatCurrency(product.revenue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};