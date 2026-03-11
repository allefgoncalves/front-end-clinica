// src/features/appointments/pages/Appointments/Appointments.tsx
import React from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { AppointmentsTable } from '../../components/AppointmentsTable/AppointmentsTable';
import { AppointmentsFilters } from '../../components/AppointmentsFilters/AppointmentsFilters';
import { AppointmentForm } from '../../components/AppointmentForm/AppointmentForm';
import styles from './Appointments.module.css';

const Appointments: React.FC = () => {
  const {
    appointments,
    loading,
    filters,
    setFilters,
    sortField,
    sortOrder,
    handleSort,
    handleCancel,
    handleDelete,
    handleEdit,
    handleFormSave,
    selectedAppointment,
    setSelectedAppointment,
    showForm,
    setShowForm,
    pagination,
    handlePageChange,
    expandedId,
    toggleExpand
  } = useAppointments();

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowForm(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📅 Gerenciar Agendamentos</h1>
        <button onClick={handleNewAppointment} className={styles.newButton}>
          + Novo Agendamento
        </button>
      </div>

      <AppointmentsFilters filters={filters} onFilterChange={setFilters} />

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : (
          <>
            <div className={styles.infoBar}>
              <div className={styles.itemCount}>
                <span className={styles.countNumber}>{pagination.total}</span>
                <span className={styles.countLabel}>
                  {pagination.total === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}
                </span>
              </div>
              <div className={styles.pageInfo}>
                Mostrando {appointments.length} de {pagination.total}
              </div>
            </div>

            <AppointmentsTable
              appointments={appointments}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onEdit={handleEdit}
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
        <AppointmentForm
          appointment={selectedAppointment}
          onSave={handleFormSave}
          onClose={() => {
            setShowForm(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default Appointments;