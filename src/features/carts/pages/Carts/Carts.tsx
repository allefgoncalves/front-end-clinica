// src/features/carts/pages/Carts/Carts.tsx
import React from 'react';
import { useCarts } from '../../hooks/useCarts';
import { CartsTable } from '../../components/CartsTable/CartsTable';
import { MessageModal } from '../../components/MessageModal/MessageModal';
import styles from './Carts.module.css';

const Carts: React.FC = () => {
  const {
    carts,
    loading,
    filters,
    setFilters,
    showMessageModal,
    setShowMessageModal,
    selectedCart,
    handleSelectCart,
    handleApplyDiscount,
    handleSaveNotes,
    handleRemoveItem,
    handleUpdateQuantity,
    refresh
  } = useCarts();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛒 Análise de Carrinhos</h1>
        <button onClick={refresh} className={styles.refreshButton}>
          🔄 Atualizar
        </button>
      </div>

      <div className={styles.filtersBar}>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
          className={styles.filterSelect}
        >
          <option value="">Todos os status</option>
          <option value="active">🟢 Ativos</option>
          <option value="abandoned">🟡 Abandonados</option>
          <option value="converted">✅ Convertidos</option>
        </select>

        <select
          value={filters.days}
          onChange={(e) => setFilters({ ...filters, days: Number(e.target.value) })}
          className={styles.filterSelect}
        >
          <option value="7">Últimos 7 dias</option>
          <option value="15">Últimos 15 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="60">Últimos 60 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando carrinhos...</p>
          </div>
        ) : (
          <CartsTable
            carts={carts}
            onSelectCart={handleSelectCart}
            onOpenMessage={(cart) => {
              handleSelectCart(cart);
              setShowMessageModal(true);
            }}
            onApplyDiscount={handleApplyDiscount}
            onSaveNotes={handleSaveNotes}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}
      </div>

      {showMessageModal && selectedCart && (
        <MessageModal
          cart={selectedCart}
          discountResult={null}
          notes=""
          onClose={() => setShowMessageModal(false)}
          onSend={(message) => {
            console.log('Mensagem enviada:', message);
            setShowMessageModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Carts;