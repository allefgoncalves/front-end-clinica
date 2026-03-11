// src/features/carts/components/CartDetails/CartDetails.tsx
import React, { useState } from 'react';
import { CartSnapshot, DiscountApply } from '../../types/cart.types';
import styles from './CartDetails.module.css';

interface CartDetailsProps {
  cart: CartSnapshot;
  discountValue: number;
  discountResult: DiscountApply | null;
  notes: string;
  onApplyDiscount: (discount: number) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
  onDiscountChange: (value: number) => void;
  onNotesChange: (notes: string) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  embedded?: boolean;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  applyingDiscount?: boolean;
  savingNotes?: boolean;
}

export const CartDetails: React.FC<CartDetailsProps> = ({
  cart,
  discountValue,
  discountResult,
  notes,
  onApplyDiscount,
  onSaveNotes,
  onDiscountChange,
  onNotesChange,
  onRemoveItem,
  onUpdateQuantity,
  embedded = false,
  showToast,
  applyingDiscount = false,
  savingNotes = false
}) => {
  const [comboPrice, setComboPrice] = useState<number | null>(
    discountResult?.discounted_total || null
  );
  const [lastEdited, setLastEdited] = useState<'discount' | 'combo' | null>(null);

  // Cálculo automático entre desconto e preço total
  React.useEffect(() => {
    if (lastEdited === 'discount' && discountValue > 0) {
      const discountAmount = cart.total * (discountValue / 100);
      const newComboPrice = cart.total - discountAmount;
      setComboPrice(Math.round(newComboPrice * 100) / 100);
    } else if (lastEdited === 'combo' && comboPrice && comboPrice > 0) {
      if (comboPrice < cart.total) {
        const newDiscount = ((cart.total - comboPrice) / cart.total) * 100;
        onDiscountChange(Math.max(0, Math.min(100, Math.round(newDiscount * 10) / 10)));
      }
    }
  }, [cart.total, discountValue, comboPrice, lastEdited, onDiscountChange]);

  const handleApplyDiscount = async () => {
    try {
      await onApplyDiscount(discountValue);
      showToast?.('Desconto aplicado com sucesso!', 'success');
    } catch (error) {
      showToast?.('Erro ao aplicar desconto', 'error');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await onSaveNotes(notes);
    } catch (error) {
      console.error('Erro capturado no componente:', error);
    }
  };

  const handleDiscountChange = (value: number) => {
    onDiscountChange(value);
    setLastEdited('discount');
  };

  const handleComboPriceChange = (value: string) => {
    const price = value === '' ? null : Number(value);
    setComboPrice(price);
    setLastEdited('combo');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
      <div className={styles.header}>
        <h2>Detalhes do Carrinho</h2>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {cart.user_name.charAt(0)}
          </div>
          <div>
            <div className={styles.userName}>{cart.user_name}</div>
            <div className={styles.userEmail}>{cart.user_email}</div>
          </div>
        </div>
      </div>

      {/* Cards de itens */}
      <div className={styles.itemsSection}>
        <h3>📦 Itens do Carrinho</h3>
        <div className={styles.itemsGrid}>
          {cart.items.map((item) => (
            <div key={item.item_id} className={styles.itemCard}>
              <div className={styles.itemCardHeader}>
                <span className={styles.itemCardType}>
                  {item.item_type === 'service' ? '🧖' : '📦'}
                </span>
                <span className={styles.itemCardName}>{item.name}</span>
              </div>
              <div className={styles.itemCardDetails}>
                <div className={styles.itemCardPrice}>
                  {formatCurrency(item.price)} × {item.quantity}
                </div>
                <div className={styles.itemCardTotal}>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observações */}
      <div className={styles.notesSection}>
        <h3>📝 Observações</h3>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Adicione observações sobre este cliente/carrinho..."
          className={styles.notesInput}
          rows={4}
        />
        <button
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className={styles.saveNotesButton}
        >
          {savingNotes ? 'Salvando...' : 'Salvar Observações'}
        </button>
      </div>
    </div>
  );
};