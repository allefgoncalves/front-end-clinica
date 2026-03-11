// src/features/services/components/ServicesFilters/ServicesFilters.tsx
import React, { useState, useEffect } from 'react';
import { ServiceFilters as FiltersType } from '../../types/service.types';
import styles from './ServicesFilters.module.css';

interface ServicesFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

const DURATION_RANGES = [
  { label: 'Até 30 min', min: 0, max: 30 },
  { label: '30 a 60 min', min: 30, max: 60 },
  { label: '60 a 90 min', min: 60, max: 90 },
  { label: 'Mais de 90 min', min: 90, max: Infinity },
];

const PRICE_RANGES = [
  { label: 'Até R$ 50', min: 0, max: 50 },
  { label: 'R$ 50 a R$ 100', min: 50, max: 100 },
  { label: 'R$ 100 a R$ 150', min: 100, max: 150 },
  { label: 'Acima de R$ 150', min: 150, max: Infinity },
];

export const ServicesFilters: React.FC<ServicesFiltersProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const categories = [
    'Massagem Relaxante',
    'Massagem Terapêutica',
    'Drenagem Linfática',
    'Quick Massagem',
    'Massagem Oriental',
    'Massagem Estética',
    'Pacotes',
    'Tratamentos Especiais'
  ];

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
      const range = PRICE_RANGES[Number(index)];
      onFilterChange({
        ...filters,
        minPrice: range.min,
        maxPrice: range.max === Infinity ? undefined : range.max
      });
    }
  };

  const handleDurationRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.value;
    if (index === '') {
      onFilterChange({
        ...filters,
        minDuration: undefined,
        maxDuration: undefined
      });
    } else {
      const range = DURATION_RANGES[Number(index)];
      onFilterChange({
        ...filters,
        minDuration: range.min,
        maxDuration: range.max === Infinity ? undefined : range.max
      });
    }
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
            placeholder="🔍 Buscar serviços por nome..."
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
                PRICE_RANGES.findIndex(r => r.min === filters.minPrice).toString() : ''}
            >
              <option value="">Todos os preços</option>
              {PRICE_RANGES.map((range, index) => (
                <option key={index} value={index}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Duração:</label>
            <select
              onChange={handleDurationRangeChange}
              className={styles.select}
              value={filters.minDuration !== undefined ? 
                DURATION_RANGES.findIndex(r => r.min === filters.minDuration).toString() : ''}
            >
              <option value="">Todas as durações</option>
              {DURATION_RANGES.map((range, index) => (
                <option key={index} value={index}>
                  {range.label}
                </option>
              ))}
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
        filters.category || 
        filters.minPrice || 
        filters.maxPrice ||
        filters.minDuration ||
        filters.maxDuration) && (
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
          {(filters.minDuration !== undefined || filters.maxDuration !== undefined) && (
            <span className={styles.filterTag}>
              {filters.minDuration || 0} - {filters.maxDuration || '∞'} min
            </span>
          )}
        </div>
      )}
    </div>
  );
};