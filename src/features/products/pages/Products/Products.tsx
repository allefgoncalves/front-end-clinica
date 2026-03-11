// src/features/products/pages/Products/Products.tsx
import React from 'react';
import { useProducts } from '../../hooks/useProducts';
import { ProductTable } from '../../components/ProductTable/ProductTable';
import { ProductFilters } from '../../components/ProductFilters/ProductFilters';
import { ProductForm } from '../../components/ProductForm/ProductForm';
import styles from './Products.module.css';

const Products: React.FC = () => {
  const {
    products,
    loading,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    toggleStatus,
    handleDelete,
    handleEdit,
    handleFormSave,
    handleInlineSave,
    selectedProduct,
    setSelectedProduct,
    showForm,
    setShowForm,
    pagination,
    handlePageChange
  } = useProducts();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 Gerenciar Produtos</h1>
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setShowForm(true);
          }} 
          className={styles.newButton}
        >
          + Novo Produto
        </button>
      </div>

      <ProductFilters filters={filters} onFilterChange={setFilters} />

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Carregando produtos...</p>
          </div>
        ) : (
          <>
            {/* Barra de informações com contador */}
            <div className={styles.infoBar}>
              <div className={styles.itemCount}>
                <span className={styles.countNumber}>{pagination.total}</span>
                <span className={styles.countLabel}>
                  {pagination.total === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </span>
              </div>
              
              <div className={styles.pageInfo}>
                Mostrando {products.length} de {pagination.total}
              </div>
            </div>

            <ProductTable
              products={products}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              onToggleStatus={toggleStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSaveEdit={handleInlineSave}
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
        <ProductForm
          product={selectedProduct}
          onSave={handleFormSave}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Products;