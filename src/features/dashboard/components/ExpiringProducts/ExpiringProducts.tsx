// src/features/dashboard/components/ExpiringProducts/ExpiringProducts.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExpiringProduct } from '../../types/dashboard.types';
import styles from './ExpiringProducts.module.css';

interface ExpiringProductsProps {
  products: ExpiringProduct[];
}

export const ExpiringProducts: React.FC<ExpiringProductsProps> = ({ products }) => {
  if (products.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>⏳ Produtos a Vencer</h3>
        <Link to="/products?filter=expiring" className={styles.viewAll}>Ver todos</Link>
      </div>
      <div className={styles.list}>
        {products.map(product => (
          <div key={product.id} className={styles.item}>
            <span className={styles.name}>{product.name}</span>
            <span className={styles.date}>{formatDate(product.expiry_date)}</span>
            <span className={`${styles.days} ${product.days_left <= 7 ? styles.urgent : ''}`}>
              {product.days_left} dias
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};