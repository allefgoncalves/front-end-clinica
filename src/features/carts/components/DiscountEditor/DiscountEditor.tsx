// src/features/carts/components/DiscountEditor/DiscountEditor.tsx
import React from 'react';
import { DiscountApply } from '../../types/cart.types';
import styles from './DiscountEditor.module.css';

interface DiscountEditorProps {
  originalTotal: number;
  discountValue: number;
  discountResult: DiscountApply | null;
  onDiscountChange: (value: number) => void;
  onApplyDiscount: () => Promise<void>; // Função sem parâmetros
}

export const DiscountEditor: React.FC<DiscountEditorProps> = ({
  originalTotal,
  discountValue,
  discountResult,
  onDiscountChange,
  onApplyDiscount
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={styles.container}>
      <h3>💰 Simular Desconto</h3>
      
      <div className={styles.discountInput}>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={discountValue}
          onChange={(e) => onDiscountChange(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.discountValue}>
          <input
            type="number"
            min="0"
            max="100"
            value={discountValue}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
            className={styles.numberInput}
          />
          <span>%</span>
        </div>
      </div>

      <button
        onClick={onApplyDiscount}
        className={styles.applyButton}
        disabled={discountValue === 0}
      >
        Aplicar Desconto
      </button>

      {discountResult && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span>Original:</span>
            <span>{formatCurrency(discountResult.original_total)}</span>
          </div>
          <div className={styles.resultRow}>
            <span>Desconto:</span>
            <span className={styles.discountAmount}>
              -{formatCurrency(discountResult.discount_amount)}
            </span>
          </div>
          <div className={`${styles.resultRow} ${styles.final}`}>
            <span>Final:</span>
            <span>{formatCurrency(discountResult.discounted_total)}</span>
          </div>
        </div>
      )}
    </div>
  );
};