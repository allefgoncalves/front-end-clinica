// src/features/carts/components/CartsTable/CartsTable.tsx
import React, { useState } from 'react';
import { CartSnapshot } from '../../types/cart.types';
import { CartDetails } from '../CartDetails/CartDetails';
import styles from './CartsTable.module.css';

declare global {
  interface Window {
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  }
}

interface CartsTableProps {
  carts: CartSnapshot[];
  onSelectCart: (cart: CartSnapshot) => void;
  onOpenMessage: (cart: CartSnapshot) => void;
  onApplyDiscount: (cartId: string, discount: number) => Promise<void>;
  onSaveNotes: (cartId: string, notes: string) => Promise<void>;
  onRemoveItem: (cartId: string, itemId: string) => void;
  onUpdateQuantity: (cartId: string, itemId: string, quantity: number) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  onPageChange?: (newPage: number) => void;
  showMessageModal?: boolean;
  selectedCart?: CartSnapshot | null;
  discountValue?: number;
  discountResult?: any;
  onSetShowMessageModal?: (show: boolean) => void;
  onSetDiscountValue?: (value: number) => void;
}

export const CartsTable: React.FC<CartsTableProps> = ({
  carts,
  onSelectCart,
  onOpenMessage,
  onApplyDiscount,
  onSaveNotes,
  onRemoveItem,
  onUpdateQuantity,
  pagination,
  onPageChange,
  showMessageModal,
  selectedCart: externalSelectedCart,
  discountValue: externalDiscountValue,
  discountResult: externalDiscountResult,
  onSetShowMessageModal,
  onSetDiscountValue
}) => {
  const [expandedCartId, setExpandedCartId] = useState<string | null>(null);
  const [internalSelectedCart, setInternalSelectedCart] = useState<CartSnapshot | null>(null);
  const [internalDiscountValue, setInternalDiscountValue] = useState<number>(0);
  const [internalDiscountResult, setInternalDiscountResult] = useState<any>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Usar props externas se fornecidas, senão usar internas
  const selectedCart = externalSelectedCart || internalSelectedCart;
  const discountValue = externalDiscountValue !== undefined ? externalDiscountValue : internalDiscountValue;
  const discountResult = externalDiscountResult || internalDiscountResult;
  
  // CORREÇÃO: Filtrar notas que são apenas espaços
  const notes = internalNotes && internalNotes.trim() !== '' ? internalNotes : '';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para obter ícone e texto do status (MANTIDA IGUAL)
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: '🟢', text: 'Ativo', className: styles.ativo };
      case 'abandoned':
        return { icon: '🟡', text: 'Abandonado', className: styles.abandonado };
      case 'converted':
        return { icon: '✅', text: 'Convertido', className: styles.convertido };
      default:
        return { icon: '⚪', text: status, className: '' };
    }
  };

  // Explicação dos status
  const statusLegend = [
    { icon: '🟢', status: 'Ativo', description: 'Carrinho com atividade recente (menos de 5 minutos)' },
    { icon: '🟡', status: 'Abandonado', description: 'Carrinho sem atividade por mais de 5 minutos' },
    { icon: '✅', status: 'Convertido', description: 'Carrinho que resultou em venda' }
  ];

  const handleToggleExpand = (cart: CartSnapshot) => {
    if (expandedCartId === cart.id) {
      setExpandedCartId(null);
      setInternalSelectedCart(null);
    } else {
      setExpandedCartId(cart.id);
      setInternalSelectedCart(cart);
      
      // CORREÇÃO: Filtrar notas que são apenas espaços ao carregar
      const rawNotes = cart.metadata.notes || '';
      setInternalNotes(rawNotes && rawNotes.trim() !== '' ? rawNotes : '');
      
      setInternalDiscountValue(cart.metadata.discount_applied || 0);
      setInternalDiscountResult(
        cart.metadata.discount_applied
          ? {
              discount_percent: cart.metadata.discount_applied,
              original_total: cart.metadata.original_total || cart.total,
              discount_amount: cart.metadata.discount_amount || 0,
              discounted_total: cart.metadata.discounted_total || cart.total
            }
          : null
      );
    }
  };

  const handleApplyDiscount = async (discount: number) => {
    if (!selectedCart) return;
    
    setApplyingDiscount(true);
    try {
      await onApplyDiscount(selectedCart.id, discount);
      
      // Atualizar resultado localmente
      const originalTotal = selectedCart.total;
      const discountAmount = originalTotal * (discount / 100);
      const discountedTotal = originalTotal - discountAmount;
      
      setInternalDiscountResult({
        discount_percent: discount,
        original_total: originalTotal,
        discount_amount: discountAmount,
        discounted_total: discountedTotal
      });
      
      if (window.showToast) {
        window.showToast('Desconto aplicado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao aplicar desconto:', error);
      if (window.showToast) {
        window.showToast('Erro ao aplicar desconto', 'error');
      }
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCart) return;
    
    setSavingNotes(true);
    try {
      await onSaveNotes(selectedCart.id, notes);
    } catch (error) {
      console.error('Erro ao salvar observações:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (selectedCart) {
      onRemoveItem(selectedCart.id, itemId);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (selectedCart) {
      onUpdateQuantity(selectedCart.id, itemId, quantity);
    }
  };

  // Função auxiliar para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`Toast [${type}]: ${message}`);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableContainer}>
        {/* ÚNICA TABELA - SEM TABELAS ANINHADAS */}
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.thExpand}></th>
              <th className={styles.th}>CLIENTE</th>
              <th className={styles.th}>EMAIL</th>
              <th className={styles.th}>DATA/HORA</th>
              <th className={styles.th}>ITENS</th>
              <th className={styles.th}>TOTAL</th>
              <th className={styles.th}>STATUS</th>
              <th className={styles.th}>AÇÕES</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {carts.map((cart) => {
              const statusInfo = getStatusInfo(cart.status);
              const isExpanded = expandedCartId === cart.id;
              
              return (
                <React.Fragment key={cart.id}>
                  {/* Linha principal */}
                  <tr className={styles.tableRow}>
                    <td className={styles.tdExpand}>
                      <button
                        className={styles.expandButton}
                        onClick={() => handleToggleExpand(cart)}
                        title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td className={styles.td}>{cart.user_name}</td>
                    <td className={styles.td}>{cart.user_email}</td>
                    <td className={styles.td}>{formatDate(cart.created_at)}</td>
                    <td className={styles.td}>
                      <span className={styles.itemCount}>
                        {cart.metadata.item_count || cart.items.length} itens
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.total}>
                        {formatCurrency(cart.total)}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.status} ${statusInfo.className}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button
                        className={styles.messageButton}
                        onClick={() => {
                          handleToggleExpand(cart);
                          onOpenMessage(cart);
                        }}
                        title="Enviar mensagem"
                      >
                        💬
                      </button>
                    </td>
                  </tr>
                  
                  {/* Linha expandida - USANDO UMA ÚNICA CÉLULA COM COLSPAN */}
                  {isExpanded && selectedCart && selectedCart.id === cart.id && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={8} className={styles.expandedCell}>
                        {/* CONTEÚDO EXPANDIDO - SEM TABELA */}
                        <div className={styles.expandedContainer}>
                          <CartDetails
                            cart={selectedCart}
                            discountValue={discountValue}
                            discountResult={discountResult}
                            notes={notes}
                            onApplyDiscount={(discount) => handleApplyDiscount(discount)}
                            onSaveNotes={handleSaveNotes}
                            onDiscountChange={(val) => {
                              setInternalDiscountValue(val);
                              if (onSetDiscountValue) onSetDiscountValue(val);
                            }}
                            onNotesChange={setInternalNotes}
                            onRemoveItem={handleRemoveItem}
                            onUpdateQuantity={handleUpdateQuantity}
                            embedded={true}
                            showToast={showToast}
                            applyingDiscount={applyingDiscount}
                            savingNotes={savingNotes}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className={styles.paginationButton}
          >
            ← Anterior
          </button>
          
          <div className={styles.paginationInfo}>
            <span className={styles.pageIndicator}>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <span className={styles.totalIndicator}>
              Total: {pagination.total} itens
            </span>
          </div>
          
          <button
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className={styles.paginationButton}
          >
            Próxima →
          </button>
        </div>
      )}
      
      {/* Legenda dos status - FORA DA TABELA */}
      <div className={styles.statusLegend}>
        <span className={styles.legendTitle}>📊 Legenda de Status:</span>
        <div className={styles.legendItems}>
          {statusLegend.map((item, index) => (
            <div key={index} className={styles.legendItem}>
              <span className={styles.legendIcon}>{item.icon}</span>
              <span className={styles.legendStatus}>{item.status}:</span>
              <span className={styles.legendDescription}>{item.description}</span>
            </div>
          ))}
        </div>
      </div>
      
      {carts.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhum carrinho encontrado</p>
        </div>
      )}
    </div>
  );
};