// src/features/goals/components/GoalProgress/GoalProgress.tsx
import React from 'react';
import { Goal } from '../../types/goals.types';
import styles from './GoalProgress.module.css';

interface GoalProgressProps {
  goal: Goal;
  onEdit: () => void;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goal, onEdit }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') return formatCurrency(value);
    return value.toLocaleString('pt-BR');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'var(--success)';
    if (progress >= 70) return 'var(--warning)';
    return 'var(--info)';
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const today = new Date();
  const dayOfMonth = today.getDate();
  const totalDays = getDaysInMonth(goal.year, goal.month);
  const expectedProgress = (dayOfMonth / totalDays) * 100;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{goal.title}</h3>
        <button onClick={onEdit} className={styles.editButton} title="Editar meta">
          ✏️
        </button>
      </div>

      <div className={styles.values}>
        <span className={styles.current}>
          {formatValue(goal.current, goal.unit)}
        </span>
        <span className={styles.target}>
          de {formatValue(goal.target, goal.unit)}
        </span>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${Math.min(goal.progress, 100)}%`,
              backgroundColor: getProgressColor(goal.progress)
            }}
          ></div>
        </div>
        <span className={styles.percentage}>{goal.progress}%</span>
      </div>

      <div className={styles.expected}>
        <span>Esperado: {expectedProgress.toFixed(1)}%</span>
        <span className={goal.progress >= expectedProgress ? styles.ahead : styles.behind}>
          {goal.progress >= expectedProgress ? '✅ Adiantado' : '⚠️ Atrasado'}
        </span>
      </div>

      <div className={styles.days}>
        {dayOfMonth} de {totalDays} dias
      </div>
    </div>
  );
};