// src/features/promotions/pages/Promotions/Promotions.tsx
import React from 'react';
import { usePromotions } from '../../hooks/usePromotions';
import { PromotionsTable } from '../../components/PromotionsTable/PromotionsTable';
import { PromotionsFilters } from '../../components/PromotionsFilters/PromotionsFilters';
import { PromotionForm } from '../../components/PromotionForm/PromotionForm';
import styles from './Promotions.module.css';

const Promotions: React.FC = () => {
  const {
    promotions,
    loading,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    toggleStatus,
    handleDelete,
    handleEdit,
    handleNewPromotion,
    handleFormSave,
    handleInlineSave,
    selectedPromotion,
    setSelectedPromotion,
    showForm,
    setShowForm,
    pagination,
    handlePageChange,
    expandedId,
    toggleExpand,
    availableServices,
    availableProducts,
    loadingItems
  } = usePromotions();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏷️ Gerenciar Promoções</h1>
        <button 
          onClick={handleNewPromotion}
          className={styles.newButton}
        >
          + Nova Promoção
        </button>
      </div>

      <PromotionsFilters filters={filters} onFilterChange={setFilters} />

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando promoções...</p>
          </div>
        ) : (
          <>
            <div className={styles.infoBar}>
              <div className={styles.itemCount}>
                <span className={styles.countNumber}>{pagination.total}</span>
                <span className={styles.countLabel}>
                  {pagination.total === 1 ? 'promoção encontrada' : 'promoções encontradas'}
                </span>
              </div>
              <div className={styles.pageInfo}>
                Mostrando {promotions.length} de {pagination.total}
              </div>
            </div>

            <PromotionsTable
              promotions={promotions}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              onToggleStatus={toggleStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSaveEdit={handleInlineSave}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
            />
            
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
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
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className={styles.paginationButton}
              >
                Próxima →
              </button>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <PromotionForm
          promotion={selectedPromotion}
          onSave={handleFormSave}
          onClose={() => {
            setShowForm(false);
            setSelectedPromotion(null);
          }}
          availableServices={availableServices}
          availableProducts={availableProducts}
          loadingItems={loadingItems}
        />
      )}
    </div>
  );
};

export default Promotions;