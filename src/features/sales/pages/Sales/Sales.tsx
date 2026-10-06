// src/features/sales/pages/Sales/Sales.tsx
import React from 'react';
import { useSales } from '../../hooks/useSales';
import { SalesDashboard } from '../../components/SalesDashboard/SalesDashboard';
import { SalesFilters } from '../../components/SalesFilters/SalesFilters';
import { SalesTable } from '../../components/SalesTable/SalesTable';
import { BulkActions } from '../../components/BulkActions/BulkActions';
import { ProductRanking } from '../../components/ProductRanking/ProductRanking';
import styles from './Sales.module.css';

const Sales: React.FC = () => {
  const {
    sales,
    loading,
    summary,
    loadingSummary,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    selectedSales,
    toggleSelectSale,
    toggleSelectAll,
    clearSelected,
    handleBulkStatusUpdate,
    updateSaleStatus,
    updatePaymentStatus,
    handleSendReceipt,
    handleExportCSV,
    expandedId,
    toggleExpand,
    pagination,
    handlePageChange,
    dateRange,
    setDateRange
  } = useSales();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>💰 Vendas</h1>
        <div className={styles.headerStats}>
          <span className={styles.totalSales}>{pagination?.total || 0} vendas</span>
        </div>
      </div>

      {/* Dashboard com resumo */}
      <SalesDashboard
        summary={summary}
        loading={loadingSummary}
        onDateRangeChange={setDateRange}
        dateRange={dateRange}
      />

      {/* Filtros e ações em lote */}
      <SalesFilters
        filters={filters}
        onFilterChange={setFilters}
        onExportCSV={handleExportCSV}
        selectedCount={selectedSales.size}
      />

      {selectedSales.size > 0 && (
        <BulkActions
          selectedCount={selectedSales.size}
          onClearSelection={clearSelected}
          onBulkAction={handleBulkStatusUpdate}
        />
      )}

      {/* Ranking de produtos */}
      {summary && summary.top_products && summary.top_products.length > 0 && (
        <ProductRanking
          topProducts={summary.top_products || []}
          bottomProducts={summary.bottom_products || []}
          dateRange={dateRange}
        />
      )}

      {/* Tabela de vendas */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando vendas...</p>
          </div>
        ) : (
          <>
            <SalesTable
              sales={sales || []}
              selectedSales={selectedSales}
              onToggleSelect={toggleSelectSale}
              onToggleSelectAll={toggleSelectAll}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              onUpdateStatus={updateSaleStatus}
              onUpdatePaymentStatus={updatePaymentStatus}
              onSendReceipt={handleSendReceipt}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              loading={loading}
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
                  Total: {pagination.total} vendas
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
    </div>
  );
};

export default Sales;