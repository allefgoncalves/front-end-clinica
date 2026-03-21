// src/features/dashboard/components/LowStockAlert/LowStockAlert.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LowStockItem } from '../../types/dashboard.types';
import styles from './LowStockAlert.module.css';

interface LowStockAlertProps {
  products: LowStockItem[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>⚠️ Estoque Baixo</h3>
        <Link to="/products?filter=low_stock" className={styles.viewAll}>Ver todos</Link>
      </div>
      <div className={styles.list}>
        {products.map(product => (
          <Link 
            key={product.id} 
            to={`/products?search=${encodeURIComponent(product.name)}&filter=low_stock`}
            className={styles.item}
          >
            <span className={styles.name}>{product.name}</span>
            <span className={styles.stock}>
              {product.stock} / {product.min_stock}
            </span>
            <div 
              className={styles.progress}
              style={{ 
                width: `${Math.min(100, (product.stock / product.min_stock) * 100)}%` 
              }}
            ></div>
          </Link>
        ))}
      </div>
    </div>
  );
};