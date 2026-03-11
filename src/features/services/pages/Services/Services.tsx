// src/features/services/pages/Services/Services.tsx
import React from 'react';
import { useServices } from '../../hooks/useServices';
import { ServicesTable } from '../../components/ServicesTable/ServicesTable';
import { ServicesFilters } from '../../components/ServicesFilters/ServicesFilters';
import { ServiceForm } from '../../components/ServiceForm/ServiceForm';
import styles from './Services.module.css';

const Services: React.FC = () => {
  const {
    services,
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
    selectedService,
    setSelectedService,
    showForm,
    setShowForm,
    pagination,
    handlePageChange
  } = useServices();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧖 Gerenciar Serviços</h1>
        <button 
          onClick={() => {
            setSelectedService(null);
            setShowForm(true);
          }} 
          className={styles.newButton}
        >
          + Novo Serviço
        </button>
      </div>

      <ServicesFilters filters={filters} onFilterChange={setFilters} />

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Carregando serviços...</p>
          </div>
        ) : (
          <>
            <div className={styles.infoBar}>
              <div className={styles.itemCount}>
                <span className={styles.countNumber}>{pagination.total}</span>
                <span className={styles.countLabel}>
                  {pagination.total === 1 ? 'serviço encontrado' : 'serviços encontrados'}
                </span>
              </div>
              <div className={styles.pageInfo}>
                Mostrando {services.length} de {pagination.total}
              </div>
            </div>

            <ServicesTable
              services={services}
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
        <ServiceForm
          service={selectedService}
          onSave={handleFormSave}
          onClose={() => {
            setShowForm(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
};

export default Services;