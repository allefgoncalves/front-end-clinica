// src/features/dashboard/components/AbandonedCarts/AbandonedCarts.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AbandonedCart } from '../../types/dashboard.types';
import styles from './AbandonedCarts.module.css';

interface AbandonedCartsProps {
  carts: AbandonedCart[];
}

export const AbandonedCarts: React.FC<AbandonedCartsProps> = ({ carts }) => {
  if (carts.length === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>🛒 Carrinhos Abandonados</h3>
        <Link to="/carts" className={styles.viewAll}>Ver todos</Link>
      </div>
      <div className={styles.list}>
        {carts.map((cart, index) => (
          <div key={index} className={styles.item}>
            <span className={styles.client}>{cart.client}</span>
            <span className={styles.items}>{cart.items} itens</span>
            <span className={styles.total}>{formatCurrency(cart.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};