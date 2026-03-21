// src/features/dashboard/components/PromotionsWidget/PromotionsWidget.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { PromotionAlert } from '../../types/dashboard.types';
import styles from './PromotionsWidget.module.css';

interface PromotionsWidgetProps {
  starting: PromotionAlert[];
  endingSoon: PromotionAlert[];
  endingToday: PromotionAlert[];
}

export const PromotionsWidget: React.FC<PromotionsWidgetProps> = ({
  starting,
  endingSoon,
  endingToday
}) => {
  const hasPromotions = starting.length > 0 || endingSoon.length > 0 || endingToday.length > 0;

  if (!hasPromotions) {
    return null;
  }

  return (
    <div className={styles.widget}>
      <h3>🏷️ Promoções Ativas</h3>
      <div className={styles.list}>
        {endingToday.map(promo => (
          <Link to={`/promotions/${promo.id}`} key={promo.id} className={`${styles.item} ${styles.danger}`}>
            <span className={styles.icon}>🔴</span>
            <span className={styles.title}>{promo.title}</span>
            <span className={styles.badge}>Termina hoje!</span>
          </Link>
        ))}
        
        {endingSoon.map(promo => (
          <Link to={`/promotions/${promo.id}`} key={promo.id} className={`${styles.item} ${styles.warning}`}>
            <span className={styles.icon}>🟡</span>
            <span className={styles.title}>{promo.title}</span>
            <span className={styles.badge}>Termina em {promo.days} dias</span>
          </Link>
        ))}
        
        {starting.map(promo => (
          <Link to={`/promotions/${promo.id}`} key={promo.id} className={`${styles.item} ${styles.success}`}>
            <span className={styles.icon}>🟢</span>
            <span className={styles.title}>{promo.title}</span>
            <span className={styles.badge}>Começa {promo.days === 0 ? 'hoje' : 'amanhã'}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};