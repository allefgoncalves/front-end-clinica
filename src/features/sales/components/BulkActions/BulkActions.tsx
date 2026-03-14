// src/features/sales/components/BulkActions/BulkActions.tsx
import React, { useState } from 'react';
import { BulkStatusUpdate, SaleStatus, PaymentStatus } from '../../types/sales.types';
import styles from './BulkActions.module.css';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (data: BulkStatusUpdate) => Promise<void>;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAction
}) => {
  const [selectedStatus, setSelectedStatus] = useState<SaleStatus>('paid');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await onBulkAction({
        sale_ids: [], // Será preenchido pelo hook
        status: selectedStatus,
        payment_status: selectedPaymentStatus,
        notes: notes || undefined
      });
      setShowConfirm(false);
      setNotes('');
    } catch (error) {
      console.error('Erro ao aplicar ação em lote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bulkBar}>
        <div className={styles.selectedInfo}>
          <span className={styles.selectedCount}>{selectedCount}</span>
          <span className={styles.selectedText}>
            {selectedCount === 1 ? 'venda selecionada' : 'vendas selecionadas'}
          </span>
        </div>

        <div className={styles.actions}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as SaleStatus)}
            className={styles.statusSelect}
          >
            <option value="paid">💰 Marcar como Pago</option>
            <option value="separated">🔧 Marcar como Separado</option>
            <option value="delivered">✅ Marcar como Entregue</option>
            <option value="cancelled">❌ Marcar como Cancelado</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
            className={styles.paymentSelect}
          >
            <option value="paid">✅ Confirmar Pagamento</option>
            <option value="refunded">↩️ Marcar como Reembolsado</option>
          </select>

          <button
            onClick={() => setShowConfirm(true)}
            className={styles.applyButton}
            disabled={loading}
          >
            {loading ? 'Aplicando...' : 'Aplicar'}
          </button>

          <button
            onClick={onClearSelection}
            className={styles.clearButton}
          >
            ✕ Limpar
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent}>
            <h3>Confirmar ação em lote</h3>
            <p>
              Você está prestes a atualizar <strong>{selectedCount}</strong> vendas.
            </p>
            
            <div className={styles.confirmDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status da venda:</span>
                <span className={styles.detailValue}>
                  {selectedStatus === 'paid' && '💰 Pago'}
                  {selectedStatus === 'separated' && '🔧 Separado'}
                  {selectedStatus === 'delivered' && '✅ Entregue'}
                  {selectedStatus === 'cancelled' && '❌ Cancelado'}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status do pagamento:</span>
                <span className={styles.detailValue}>
                  {selectedPaymentStatus === 'paid' && '✅ Pago'}
                  {selectedPaymentStatus === 'refunded' && '↩️ Reembolsado'}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Observações (opcional):</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Pagamento confirmado em lote"
                  className={styles.notesInput}
                />
              </div>
            </div>

            <div className={styles.confirmActions}>
              <button
                onClick={() => setShowConfirm(false)}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                className={styles.confirmButton}
                disabled={loading}
              >
                {loading ? 'Aplicando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};