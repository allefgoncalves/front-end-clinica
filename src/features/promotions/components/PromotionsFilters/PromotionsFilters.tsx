// src/features/promotions/components/PromotionsFilters/PromotionsFilters.tsx
import React, { useState, useEffect } from 'react';
import { PromotionFilters as FiltersType } from '../../types/promotion.types';
import styles from './PromotionsFilters.module.css';

interface PromotionsFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

const DISCOUNT_RANGES = [
  { label: 'Até 10%', min: 0, max: 10 },
  { label: '10% a 20%', min: 10, max: 20 },
  { label: '20% a 30%', min: 20, max: 30 },
  { label: '30% a 50%', min: 30, max: 50 },
  { label: 'Acima de 50%', min: 50, max: Infinity },
];

export const PromotionsFilters: React.FC<PromotionsFiltersProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      active: value === '' ? undefined : value === 'true'
    });
  };

  const handleValidityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      valid: value === '' ? undefined : value === 'true'
    });
  };

  const handleDiscountRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.value;
    if (index === '') {
      onFilterChange({
        ...filters,
        minDiscount: undefined,
        maxDiscount: undefined
      });
    } else {
      const range = DISCOUNT_RANGES[Number(index)];
      onFilterChange({
        ...filters,
        minDiscount: range.min,
        maxDiscount: range.max === Infinity ? undefined : range.max
      });
    }
  };

  const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'service' | 'product' | 'both' | '';
    onFilterChange({
      ...filters,
      itemType: value === '' ? undefined : value
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    onFilterChange({});
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Buscar promoções por título..."
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

        <button
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          ⚙️ Filtros {showFilters ? '▲' : '▼'}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select
              value={filters.active === undefined ? '' : filters.active.toString()}
              onChange={handleStatusChange}
              className={styles.select}
            >
              <option value="">Todos</option>
              <option value="true">✅ Ativos</option>
              <option value="false">⛔ Inativos</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Validade:</label>
            <select
              value={filters.valid === undefined ? '' : filters.valid.toString()}
              onChange={handleValidityChange}
              className={styles.select}
            >
              <option value="">Todas</option>
              <option value="true">✅ Válidas agora</option>
              <option value="false">⏰ Expiradas</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Desconto:</label>
            <select
              onChange={handleDiscountRangeChange}
              className={styles.select}
              value={filters.minDiscount !== undefined ? 
                DISCOUNT_RANGES.findIndex(r => r.min === filters.minDiscount).toString() : ''}
            >
              <option value="">Todos os descontos</option>
              {DISCOUNT_RANGES.map((range, index) => (
                <option key={index} value={index}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Tipo de item:</label>
            <select
              onChange={handleItemTypeChange}
              className={styles.select}
              value={filters.itemType || ''}
            >
              <option value="">Todos</option>
              <option value="service">🧖 Serviços</option>
              <option value="product">📦 Produtos</option>
              <option value="both">🧖 + 📦 Mistos</option>
            </select>
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

      {(filters.active !== undefined || 
        filters.valid !== undefined ||
        filters.minDiscount || 
        filters.maxDiscount ||
        filters.itemType) && (
        <div className={styles.activeFilters}>
          <span>Filtros ativos:</span>
          {filters.active !== undefined && (
            <span className={styles.filterTag}>
              {filters.active ? '✅ Ativos' : '⛔ Inativos'}
            </span>
          )}
          {filters.valid !== undefined && (
            <span className={styles.filterTag}>
              {filters.valid ? '✅ Válidas' : '⏰ Expiradas'}
            </span>
          )}
          {(filters.minDiscount !== undefined || filters.maxDiscount !== undefined) && (
            <span className={styles.filterTag}>
              {filters.minDiscount || 0}% - {filters.maxDiscount || '∞'}%
            </span>
          )}
          {filters.itemType && (
            <span className={styles.filterTag}>
              {filters.itemType === 'service' ? '🧖 Serviços' : 
               filters.itemType === 'product' ? '📦 Produtos' : '🧖 + 📦 Mistos'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};