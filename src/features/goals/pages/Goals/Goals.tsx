// src/features/goals/pages/Goals/Goals.tsx
import React, { useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import { GoalCard } from '../../components/GoalCard';
import { GoalProgress } from '../../components/GoalProgress';
import { GoalForm } from '../../components/GoalForm';
import { GoalsList } from '../../components/GoalsList';
import { GoalHistory } from '../../components/GoalHistory';
import { Goal, GoalStatus } from '../../types/goals.types';
import styles from './Goals.module.css';

const Goals: React.FC = () => {
  const {
    currentGoals,
    goals,
    loading,
    filters,
    setFilters,
    pagination,
    handlePageChange,
    handleCreate,
    handleUpdate,
    handleDelete
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'all'>('current');

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedGoal(null);
  };

  const handleFormSave = async (data: any) => {
    if (selectedGoal) {
      await handleUpdate(selectedGoal.id, data);
    } else {
      await handleCreate(data);
    }
    handleFormClose();
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎯 Metas</h1>
        <button onClick={() => setShowForm(true)} className={styles.newButton}>
          + Nova Meta
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'current' ? styles.active : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Mês Atual
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todas as Metas
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className={styles.content}>
        {activeTab === 'current' && (
          <div className={styles.currentMonth}>
            <h2>{currentMonth}/{currentYear}</h2>
            <div className={styles.progressGrid}>
              {currentGoals.map(goal => (
                <GoalProgress
                  key={goal.id}
                  goal={goal}
                  onEdit={() => handleEdit(goal)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <GoalHistory />
        )}

        {activeTab === 'all' && (
          <>
            {/* Filtros */}
            <div className={styles.filters}>
              <select
                value={filters.year || ''}
                onChange={(e) => setFilters({ ...filters, year: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.filterSelect}
              >
                <option value="">Todos os anos</option>
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={filters.month || ''}
                onChange={(e) => setFilters({ ...filters, month: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.filterSelect}
              >
                <option value="">Todos os meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  status: e.target.value as GoalStatus || undefined 
                })}
                className={styles.filterSelect}
              >
                <option value="">Todos os status</option>
                <option value="active">Ativas</option>
                <option value="completed">Concluídas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            {/* Lista de Metas */}
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Carregando metas...</p>
              </div>
            ) : (
              <>
                <GoalsList
                  goals={goals}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                
                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className={styles.paginationButton}
                    >
                      ← Anterior
                    </button>
                    <span className={styles.pageInfo}>
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className={styles.paginationButton}
                    >
                      Próxima →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <GoalForm
          goal={selectedGoal}
          onSave={handleFormSave}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Goals;