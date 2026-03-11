// src/features/sales/pages/Sales/Sales.tsx
import React from 'react';
import styles from './Sales.module.css';

const Sales: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>💰 Vendas</h1>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.infoBar}>
          <div className={styles.itemCount}>
            <span className={styles.countNumber}>0</span>
            <span className={styles.countLabel}>vendas encontradas</span>
          </div>
        </div>

        <div className={styles.emptyState}>
          <p>Página de vendas em desenvolvimento</p>
          <p className={styles.subText}>Em breve você poderá gerenciar todas as vendas aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default Sales;