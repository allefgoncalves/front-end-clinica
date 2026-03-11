// src/features/carts/hooks/useCarts.ts
import { useState, useEffect, useCallback } from 'react';
import { CartSnapshot, CartSnapshotFilter, DiscountApply } from '../types/cart.types';
import { cartsService } from '../services/cartsService';

export const useCarts = () => {
  const [carts, setCarts] = useState<CartSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CartSnapshotFilter>({
    days: 30,
    status: undefined
  });
  const [selectedCart, setSelectedCart] = useState<CartSnapshot | null>(null);
  const [expandedCartId, setExpandedCartId] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountResult, setDiscountResult] = useState<DiscountApply | null>(null);
  const [notes, setNotes] = useState('');

  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Carregando snapshots com filtros:', filters);
      
      const data = await cartsService.getSnapshots(filters);
      setCarts(data);
    } catch (error) {
      console.error('Erro ao carregar carrinhos:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCarts();
  }, [loadCarts]);

  const toggleExpand = (cartId: string) => {
    setExpandedCartId(expandedCartId === cartId ? null : cartId);
  };

  const handleSelectCart = (cart: CartSnapshot) => {
    setSelectedCart(cart);
    setNotes(cart.metadata.notes || '');
    setDiscountValue(cart.metadata.discount_applied || 0);
    setDiscountResult(
      cart.metadata.discount_applied
        ? {
            discount_percent: cart.metadata.discount_applied,
            original_total: cart.metadata.original_total || cart.total,
            discount_amount: cart.metadata.discount_amount || 0,
            discounted_total: cart.metadata.discounted_total || cart.total
          }
        : null
    );
  };

  const handleApplyDiscount = async (cartId: string, discount: number): Promise<void> => {
    try {
      const result = await cartsService.applyDiscount(cartId, discount);
      setDiscountResult(result);
      
      // Atualiza o cart na lista
      setCarts(prev => prev.map(c => 
        c.id === cartId 
          ? { 
              ...c, 
              metadata: {
                ...c.metadata,
                discount_applied: discount,
                original_total: result.original_total,
                discounted_total: result.discounted_total,
                discount_amount: result.discount_amount
              }
            }
          : c
      ));
      
      if (selectedCart?.id === cartId) {
        setDiscountResult(result);
      }
      
      console.log('Desconto aplicado com sucesso:', result);
    } catch (error) {
      console.error('Erro ao aplicar desconto:', error);
      throw error;
    }
  };

  const handleSaveNotes = async (cartId: string, notesText: string) => {
    try {
      const notesForApi = notesText === '' ? ' ' : notesText;
      await cartsService.addNotes(cartId, notesForApi);
      
      const finalNotes = notesText === '' ? '' : notesText;
      
      setCarts(prev => prev.map(c => 
        c.id === cartId 
          ? { ...c, metadata: { ...c.metadata, notes: finalNotes } }
          : c
      ));
      
      if (selectedCart?.id === cartId) {
        setSelectedCart(prev => prev ? { 
          ...prev, 
          metadata: { ...prev.metadata, notes: finalNotes } 
        } : null);
      }

      if (window.showToast) {
        window.showToast('Observações salvas com sucesso!', 'success');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar observações:', error);
      if (window.showToast) {
        window.showToast('Erro ao salvar observações', 'error');
      }
      throw error;
    }
  };

  const handleRemoveItem = (cartId: string, itemId: string) => {
    setCarts(prev => prev.map(c => {
      if (c.id === cartId) {
        const updatedItems = c.items.filter(item => item.item_id !== itemId);
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { ...c, items: updatedItems, total: newTotal };
      }
      return c;
    }));
    
    if (selectedCart?.id === cartId) {
      const updatedItems = selectedCart.items.filter(item => item.item_id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setSelectedCart({ ...selectedCart, items: updatedItems, total: newTotal });
    }
  };

  const handleUpdateQuantity = (cartId: string, itemId: string, newQuantity: number) => {
    setCarts(prev => prev.map(c => {
      if (c.id === cartId) {
        const updatedItems = c.items.map(item => 
          item.item_id === itemId ? { ...item, quantity: newQuantity } : item
        );
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { ...c, items: updatedItems, total: newTotal };
      }
      return c;
    }));
    
    if (selectedCart?.id === cartId) {
      const updatedItems = selectedCart.items.map(item => 
        item.item_id === itemId ? { ...item, quantity: newQuantity } : item
      );
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setSelectedCart({ ...selectedCart, items: updatedItems, total: newTotal });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return {
    carts,
    loading,
    filters,
    setFilters,
    selectedCart,
    expandedCartId,
    showMessageModal,
    discountValue,
    discountResult,
    notes,
    toggleExpand,
    handleSelectCart,
    handleApplyDiscount,
    handleSaveNotes,
    handleRemoveItem,
    handleUpdateQuantity,
    setShowMessageModal,
    setDiscountValue,
    setNotes,
    refresh: loadCarts,
    handlePageChange
  };
};