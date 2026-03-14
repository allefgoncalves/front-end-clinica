// src/features/sales/components/ProductRanking/ProductRanking.tsx
import React from 'react';
import styles from './ProductRanking.module.css';

interface ProductRankingProps {
  topProducts: {
    product_id: string;
    product_name: string;
    quantity: number;
    revenue: number;
  }[];
  bottomProducts: {
    product_id: string;
    product_name: string;
    quantity: number;
    revenue: number;
  }[];
  dateRange: { startDate: string; endDate: string };
}

export const ProductRanking: React.FC<ProductRankingProps> = ({
  topProducts = [], // CORRIGIDO: valor padrão
  bottomProducts = [], // CORRIGIDO: valor padrão
  dateRange
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.ranking}>
      <div className={styles.header}>
        <h3>🏆 Ranking de Produtos</h3>
        <span className={styles.period}>
          {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
        </span>
      </div>

      <div className={styles.grid}>
        {/* Mais Vendidos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🔥 Mais Vendidos</span>
          </div>
          <div className={styles.list}>
            {!topProducts || topProducts.length === 0 ? (
              <div className={styles.empty}>Nenhum produto vendido no período</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.product_id} className={styles.item}>
                  <div className={styles.rank}>#{index + 1}</div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{product.product_name}</span>
                    <div className={styles.itemStats}>
                      <span className={styles.itemQuantity}>{product.quantity} vendidos</span>
                      <span className={styles.itemRevenue}>{formatCurrency(product.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menos Vendidos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>📉 Menos Vendidos</span>
          </div>
          <div className={styles.list}>
            {!bottomProducts || bottomProducts.length === 0 ? (
              <div className={styles.empty}>Nenhum dado disponível</div>
            ) : (
              bottomProducts.map((product, index) => (
                <div key={product.product_id} className={styles.item}>
                  <div className={styles.rank}>#{index + 1}</div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{product.product_name}</span>
                    <div className={styles.itemStats}>
                      <span className={styles.itemQuantity}>{product.quantity} vendidos</span>
                      <span className={styles.itemRevenue}>{formatCurrency(product.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};