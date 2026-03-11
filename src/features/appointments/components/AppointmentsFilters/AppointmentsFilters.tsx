// src/features/appointments/components/AppointmentsFilters/AppointmentsFilters.tsx
import React, { useState, useEffect } from 'react';
import { AppointmentFilters as FiltersType } from '../../types/appointment.types';
import styles from './AppointmentsFilters.module.css';

interface AppointmentsFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

export const AppointmentsFilters: React.FC<AppointmentsFiltersProps> = ({ 
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
      status: value === '' ? undefined : value as any
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'start_date' | 'end_date') => {
    onFilterChange({
      ...filters,
      [field]: e.target.value || undefined
    });
  };

  const handleMassagistaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      massagista_id: e.target.value || undefined
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
            placeholder="🔍 Buscar por nome do cliente..."
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
              value={filters.status || ''}
              onChange={handleStatusChange}
              className={styles.select}
            >
              <option value="">Todos</option>
              <option value="confirmed">✅ Confirmado</option>
              <option value="cancelled">❌ Cancelado</option>
              <option value="completed">✓ Concluído</option>
              <option value="no_show">⚠️ Não compareceu</option>
            </select>
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

          <div className={styles.filterGroup}>
            <label>ID do Massagista:</label>
            <input
              type="text"
              value={filters.massagista_id || ''}
              onChange={handleMassagistaChange}
              placeholder="Digite o ID do massagista"
              className={styles.input}
            />
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

      {(filters.status !== undefined || 
        filters.start_date || 
        filters.end_date || 
        filters.massagista_id) && (
        <div className={styles.activeFilters}>
          <span>Filtros ativos:</span>
          {filters.status && (
            <span className={styles.filterTag}>
              Status: {filters.status}
            </span>
          )}
          {(filters.start_date || filters.end_date) && (
            <span className={styles.filterTag}>
              {filters.start_date || '...'} até {filters.end_date || '...'}
            </span>
          )}
          {filters.massagista_id && (
            <span className={styles.filterTag}>
              Massagista ID: {filters.massagista_id}
            </span>
          )}
        </div>
      )}
    </div>
  );
};