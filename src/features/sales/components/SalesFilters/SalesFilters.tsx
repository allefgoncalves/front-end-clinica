// src/features/sales/components/SalesFilters/SalesFilters.tsx
import React, { useState, useEffect } from 'react';
import { SalesFilters as FiltersType, SaleStatus, PaymentStatus } from '../../types/sales.types';
import styles from './SalesFilters.module.css';

interface SalesFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
  onExportCSV: () => void;
  selectedCount: number;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
  filters,
  onFilterChange,
  onExportCSV,
  selectedCount
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState<SaleStatus[]>([]);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchTerm || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilterChange({ ...filters, search: undefined });
  };

  const handleStatusToggle = (status: SaleStatus) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    setSelectedStatus(newStatus);
    onFilterChange({
      ...filters,
      status: newStatus.length ? newStatus : undefined
    });
  };

  const handlePaymentStatusToggle = (status: PaymentStatus) => {
    const newStatus = selectedPaymentStatus.includes(status)
      ? selectedPaymentStatus.filter(s => s !== status)
      : [...selectedPaymentStatus, status];
    
    setSelectedPaymentStatus(newStatus);
    onFilterChange({
      ...filters,
      payment_status: newStatus.length ? newStatus : undefined
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'start_date' | 'end_date') => {
    onFilterChange({
      ...filters,
      [field]: e.target.value || undefined
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus([]);
    setSelectedPaymentStatus([]);
    onFilterChange({});
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Buscar por cliente, email ou ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className={styles.clearSearch}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.exportButton}
            onClick={onExportCSV}
            title="Exportar CSV"
          >
            📄 Exportar
          </button>
          <button
            className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            ⚙️ Filtros {showFilters ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className={styles.selectedBar}>
          <span className={styles.selectedInfo}>
            {selectedCount} {selectedCount === 1 ? 'venda selecionada' : 'vendas selecionadas'}
          </span>
        </div>
      )}

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Status da Venda:</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStatus.includes('pending')}
                  onChange={() => handleStatusToggle('pending')}
                />
                <span className={styles.checkboxText}>⏳ Pendente</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStatus.includes('paid')}
                  onChange={() => handleStatusToggle('paid')}
                />
                <span className={styles.checkboxText}>💰 Pago</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStatus.includes('separated')}
                  onChange={() => handleStatusToggle('separated')}
                />
                <span className={styles.checkboxText}>🔧 Separado</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStatus.includes('delivered')}
                  onChange={() => handleStatusToggle('delivered')}
                />
                <span className={styles.checkboxText}>✅ Entregue</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStatus.includes('cancelled')}
                  onChange={() => handleStatusToggle('cancelled')}
                />
                <span className={styles.checkboxText}>❌ Cancelado</span>
              </label>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Status do Pagamento:</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedPaymentStatus.includes('pending')}
                  onChange={() => handlePaymentStatusToggle('pending')}
                />
                <span className={styles.checkboxText}>⏳ Pendente</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedPaymentStatus.includes('paid')}
                  onChange={() => handlePaymentStatusToggle('paid')}
                />
                <span className={styles.checkboxText}>✅ Pago</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedPaymentStatus.includes('refunded')}
                  onChange={() => handlePaymentStatusToggle('refunded')}
                />
                <span className={styles.checkboxText}>↩️ Reembolsado</span>
              </label>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Período:</label>
            <div className={styles.dateRange}>
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleDateChange(e, 'start_date')}
                className={styles.dateInput}
                placeholder="Data inicial"
              />
              <span>até</span>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleDateChange(e, 'end_date')}
                className={styles.dateInput}
                placeholder="Data final"
              />
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              onClick={handleClearFilters}
              className={styles.clearButton}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Indicador de filtros ativos */}
      {(selectedStatus.length > 0 || selectedPaymentStatus.length > 0 || filters.start_date || filters.end_date) && (
        <div className={styles.activeFilters}>
          <span>Filtros ativos:</span>
          {selectedStatus.map(status => (
            <span key={status} className={styles.filterTag}>
              {status === 'pending' && '⏳ Pendente'}
              {status === 'paid' && '💰 Pago'}
              {status === 'separated' && '🔧 Separado'}
              {status === 'delivered' && '✅ Entregue'}
              {status === 'cancelled' && '❌ Cancelado'}
            </span>
          ))}
          {selectedPaymentStatus.map(status => (
            <span key={status} className={styles.filterTag}>
              {status === 'pending' && '⏳ Pagto Pendente'}
              {status === 'paid' && '✅ Pago'}
              {status === 'refunded' && '↩️ Reembolsado'}
            </span>
          ))}
          {(filters.start_date || filters.end_date) && (
            <span className={styles.filterTag}>
              {filters.start_date || '...'} até {filters.end_date || '...'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};