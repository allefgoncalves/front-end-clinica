// src/features/goals/components/GoalCard/GoalCard.tsx
import React from 'react';
import { Goal } from '../../types/goals.types';
import styles from './GoalCard.module.css';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') return formatCurrency(value);
    return value.toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '⏳';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '⚪';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return styles.active;
      case 'completed': return styles.completed;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'var(--success)';
    if (progress >= 70) return 'var(--warning)';
    return 'var(--info)';
  };

  return (
    <div className={`${styles.card} ${getStatusClass(goal.status)}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>{goal.title}</h3>
          <span className={styles.type}>
            {goal.type === 'revenue' && '💰'}
            {goal.type === 'quantity' && '📦'}
            {goal.type === 'custom' && '🎯'}
          </span>
        </div>
        <span className={styles.status}>{getStatusIcon(goal.status)}</span>
      </div>

      {goal.description && (
        <p className={styles.description}>{goal.description}</p>
      )}

      <div className={styles.dates}>
        <span>{goal.month}/{goal.year}</span>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.values}>
          <span className={styles.current}>
            {formatValue(goal.current, goal.unit)}
          </span>
          <span className={styles.target}>
            / {formatValue(goal.target, goal.unit)}
          </span>
        </div>

        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${Math.min(goal.progress, 100)}%`,
              backgroundColor: getProgressColor(goal.progress)
            }}
          ></div>
        </div>

        <div className={styles.percentage}>
          {goal.progress}% concluído
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={onEdit} className={styles.editBtn} title="Editar">
          ✏️
        </button>
        <button onClick={onDelete} className={styles.deleteBtn} title="Excluir">
          🗑️
        </button>
      </div>
    </div>
  );
};