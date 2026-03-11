// src/features/carts/components/MessageModal/MessageModal.tsx
import React, { useState, useEffect } from 'react';
import { CartSnapshot, DiscountApply } from '../../types/cart.types';
import styles from './MessageModal.module.css';

interface MessageModalProps {
  cart: CartSnapshot;
  discountResult: DiscountApply | null;
  notes: string;
  onClose: () => void;
  onSend: (message: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  cart,
  discountResult,
  notes,
  onClose,
  onSend,
  showToast
}) => {
  const [message, setMessage] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(cart.items.map(item => item.item_id))
  );
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    cart.items.reduce((acc, item) => ({ ...acc, [item.item_id]: item.quantity }), {})
  );
  const [localDiscountValue, setLocalDiscountValue] = useState<number>(
    discountResult?.discount_percent || 0
  );
  const [localComboPrice, setLocalComboPrice] = useState<number | null>(
    discountResult?.discounted_total || null
  );
  const [lastEdited, setLastEdited] = useState<'discount' | 'combo' | null>(null);
  const [sending, setSending] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(1);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calcular subtotal dos itens selecionados com suas quantidades
  const calculateSelectedSubtotal = () => {
    return cart.items
      .filter(item => selectedItems.has(item.item_id))
      .reduce((sum, item) => sum + (item.price * (itemQuantities[item.item_id] || item.quantity)), 0);
  };

  // Cálculo automático entre desconto e preço total
  useEffect(() => {
    const subtotal = calculateSelectedSubtotal();

    if (lastEdited === 'discount' && localDiscountValue > 0) {
      const discountAmount = subtotal * (localDiscountValue / 100);
      const newComboPrice = subtotal - discountAmount;
      setLocalComboPrice(Math.round(newComboPrice * 100) / 100);
    } else if (lastEdited === 'combo' && localComboPrice && localComboPrice > 0) {
      if (localComboPrice < subtotal) {
        const newDiscount = ((subtotal - localComboPrice) / subtotal) * 100;
        setLocalDiscountValue(Math.max(0, Math.min(100, Math.round(newDiscount * 10) / 10)));
      }
    }
  }, [cart.items, selectedItems, itemQuantities, localDiscountValue, localComboPrice, lastEdited]);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItemQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
  };

  const startEditingQuantity = (itemId: string, currentQuantity: number) => {
    setEditingQuantity(itemId);
    setTempQuantity(currentQuantity);
  };

  const saveQuantity = (itemId: string) => {
    if (tempQuantity >= 1) {
      handleQuantityChange(itemId, tempQuantity);
    }
    setEditingQuantity(null);
  };

  const cancelEditing = () => {
    setEditingQuantity(null);
  };

  const generateMessage = () => {
    const selectedItemsList = cart.items.filter(item => selectedItems.has(item.item_id));
    const subtotal = selectedItemsList.reduce((sum, item) => 
      sum + (item.price * (itemQuantities[item.item_id] || item.quantity)), 0
    );
    const discount = localDiscountValue;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    let msg = `Olá ${cart.user_name}! Tudo bem?\n\n`;
    msg += `Vi que você estava interessado nos seguintes itens:\n\n`;
    
    selectedItemsList.forEach(item => {
      const quantity = itemQuantities[item.item_id] || item.quantity;
      msg += `• ${quantity}x ${item.name} - ${formatCurrency(item.price * quantity)}\n`;
    });
    
    msg += `\nSubtotal: ${formatCurrency(subtotal)}`;
    
    if (discount > 0) {
      msg += `\nDesconto de ${discount}%: -${formatCurrency(discountAmount)}`;
      msg += `\nTotal com desconto: ${formatCurrency(total)}`;
    }
    
    msg += `\n\n${notes ? `Obs: ${notes}\n\n` : '\n'}`;
    msg += `Posso ajudar com algo? 😊`;
    
    return msg;
  };

  const handleSend = () => {
    setSending(true);
    try {
      onSend(message || generateMessage());
      if (showToast) {
        showToast('Mensagem enviada com sucesso!', 'success');
      }
    } catch (error) {
      if (showToast) {
        showToast('Erro ao enviar mensagem', 'error');
      }
    } finally {
      setSending(false);
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>💬 Enviar Mensagem</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.section}>
            <h3>Selecionar Itens</h3>
            <div className={styles.itemsList}>
              {cart.items.map((item) => {
                const quantity = itemQuantities[item.item_id] || item.quantity;
                const isEditing = editingQuantity === item.item_id;
                
                return (
                  <div key={item.item_id} className={styles.itemRow}>
                    {/* Checkbox e nome do item à esquerda */}
                    <label className={styles.itemCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.item_id)}
                        onChange={() => toggleItem(item.item_id)}
                      />
                      <span className={styles.itemType}>
                        {item.item_type === 'service' ? '🧖' : '📦'}
                      </span>
                      <span className={styles.itemName}>{item.name}</span>
                    </label>
                    
                    {/* Container para quantidade e preço à direita */}
                    <div className={styles.itemRightContainer}>
                      <div className={styles.itemQuantityControl}>
                        {isEditing ? (
                          <div className={styles.quantityEdit}>
                            <input
                              type="number"
                              min="1"
                              value={tempQuantity}
                              onChange={(e) => setTempQuantity(Number(e.target.value))}
                              className={styles.quantityInput}
                              autoFocus
                            />
                            <button
                              onClick={() => saveQuantity(item.item_id)}
                              className={styles.saveQuantityButton}
                              title="Salvar"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditing}
                              className={styles.cancelQuantityButton}
                              title="Cancelar"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className={styles.quantityDisplay}>
                            <span className={styles.quantityValue}>x{quantity}</span>
                            <button
                              onClick={() => startEditingQuantity(item.item_id, quantity)}
                              className={styles.editQuantityButton}
                              title="Editar quantidade"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <span className={styles.itemPrice}>
                        {formatCurrency(item.price * quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção de Desconto */}
          <div className={styles.discountSection}>
            <h3>💰 Desconto e Resumo</h3>
            
            <div className={styles.discountRow}>
              <div className={styles.discountGroup}>
                <label htmlFor="discount_percent">Desconto (%)</label>
                <input
                  type="number"
                  id="discount_percent"
                  min="0"
                  max="100"
                  step="0.1"
                  value={localDiscountValue === 0 ? '' : localDiscountValue}
                  onChange={(e) => {
                    setLocalDiscountValue(e.target.value === '' ? 0 : Number(e.target.value));
                    setLastEdited('discount');
                  }}
                  placeholder="0"
                  className={styles.discountInput}
                />
              </div>

              <div className={styles.discountGroup}>
                <label htmlFor="combo_price">Preço com desconto</label>
                <input
                  type="number"
                  id="combo_price"
                  min="0"
                  step="0.01"
                  value={localComboPrice === null ? '' : localComboPrice}
                  onChange={(e) => {
                    setLocalComboPrice(e.target.value === '' ? null : Number(e.target.value));
                    setLastEdited('combo');
                  }}
                  placeholder="R$ 0,00"
                  className={styles.discountInput}
                />
              </div>
            </div>

            {/* Resumo */}
            <div className={styles.summary}>
              {(() => {
                const subtotal = calculateSelectedSubtotal();
                const discountAmount = subtotal * (localDiscountValue / 100);
                const total = subtotal - discountAmount;

                return (
                  <>
                    <div className={styles.summaryRow}>
                      <span>Subtotal dos itens selecionados:</span>
                      <strong>{formatCurrency(subtotal)}</strong>
                    </div>
                    
                    {localDiscountValue > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Desconto ({localDiscountValue}%):</span>
                        <span className={styles.discountAmount}>
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Total com desconto:</span>
                      <strong className={styles.finalTotal}>
                        {formatCurrency(total)}
                      </strong>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Pré-visualização</h3>
            <textarea
              value={message || generateMessage()}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.messagePreview}
              rows={8}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton} disabled={sending}>
            Cancelar
          </button>
          <button 
            onClick={handleSend} 
            className={styles.sendButton}
            disabled={sending}
          >
            {sending ? 'Enviando...' : '💬 Enviar via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
};