// src/features/products/components/ProductFilters/ProductFilters.tsx
import React, { useState, useEffect } from 'react';
import { ProductFilters as FiltersType } from '../../types/product.types';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

// Constantes para os thresholds
const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_WARNING_DAYS = 30;

export const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const categories = [
    'Óleos Essenciais',
    'Cremes',
    'Acessórios',
    'Equipamentos',
    'Velas Aromáticas',
    'Incensos',
    'Massageadores',
    'Aromatizadores'
  ];

  const priceRanges = [
    { label: 'Até R$ 50', min: 0, max: 50 },
    { label: 'R$ 50 a R$ 100', min: 50, max: 100 },
    { label: 'R$ 100 a R$ 200', min: 100, max: 200 },
    { label: 'Acima de R$ 200', min: 200, max: Infinity },
  ];

  // Efeito para busca com debounce
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
    // CORRIGIDO: Agora passa o valor correto para a API
    onFilterChange({
      ...filters,
      active: value === '' ? undefined : value === 'true'
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      category: e.target.value || undefined
    });
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.value;
    if (index === '') {
      onFilterChange({
        ...filters,
        minPrice: undefined,
        maxPrice: undefined
      });
    } else {
      const range = priceRanges[Number(index)];
      onFilterChange({
        ...filters,
        minPrice: range.min,
        maxPrice: range.max === Infinity ? undefined : range.max
      });
    }
  };

  const handleLowStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      lowStock: e.target.checked ? true : undefined
    });
  };

  const handleExpiringSoonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      expiringSoon: e.target.checked ? true : undefined
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
            placeholder="🔍 Buscar produtos por nome..."
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
              <option value="">Todos (ativos e inativos)</option>
              <option value="true">✅ Apenas Ativos</option>
              <option value="false">⛔ Apenas Inativos</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Categoria:</label>
            <select
              value={filters.category || ''}
              onChange={handleCategoryChange}
              className={styles.select}
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Faixa de Preço:</label>
            <select
              onChange={handlePriceRangeChange}
              className={styles.select}
              value={filters.minPrice !== undefined ? 
                priceRanges.findIndex(r => r.min === filters.minPrice).toString() : ''}
            >
              <option value="">Todos os preços</option>
              {priceRanges.map((range, index) => (
                <option key={index} value={index}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Alertas:</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel} title={`Estoque menor ou igual a ${LOW_STOCK_THRESHOLD} unidades`}>
                <input
                  type="checkbox"
                  checked={filters.lowStock || false}
                  onChange={handleLowStockChange}
                />
                <span className={styles.checkboxText}>
                  <span style={{ color: 'var(--warning)' }}>🟡</span> 
                  Estoque baixo (≤ {LOW_STOCK_THRESHOLD})
                </span>
              </label>

              <label className={styles.checkboxLabel} title={`Produtos que vencem em até ${EXPIRY_WARNING_DAYS} dias`}>
                <input
                  type="checkbox"
                  checked={filters.expiringSoon || false}
                  onChange={handleExpiringSoonChange}
                />
               <span className={styles.checkboxText}>
                  <span style={{ color: 'var(--warning)' }}>⚠️</span> 
                  Próximo ao vencimento
                  <br />
                  <span className={styles.thresholdInfo}>(≤ {EXPIRY_WARNING_DAYS} dias)</span>
                </span>
              </label>
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
      {(filters.active !== undefined || 
        filters.category || 
        filters.minPrice || 
        filters.maxPrice || 
        filters.lowStock || 
        filters.expiringSoon) && (
        <div className={styles.activeFilters}>
          <span>Filtros ativos:</span>
          {filters.active !== undefined && (
            <span className={styles.filterTag}>
              {filters.active ? '✅ Ativos' : '⛔ Inativos'}
            </span>
          )}
          {filters.category && (
            <span className={styles.filterTag}>
              {filters.category}
            </span>
          )}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <span className={styles.filterTag}>
              R$ {filters.minPrice || 0} - R$ {filters.maxPrice || '∞'}
            </span>
          )}
          {filters.lowStock && (
            <span className={styles.filterTag}>
              🟡 Estoque baixo (≤ {LOW_STOCK_THRESHOLD})
            </span>
          )}
          {filters.expiringSoon && (
            <span className={styles.filterTag}>
              ⚠️ Vence em ≤ {EXPIRY_WARNING_DAYS} dias
            </span>
          )}
        </div>
      )}
    </div>
  );
};