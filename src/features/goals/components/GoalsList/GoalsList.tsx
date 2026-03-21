// src/features/goals/components/GoalsList/GoalsList.tsx
import React from 'react';
import { Goal } from '../../types/goals.types';
import { GoalCard } from '../GoalCard';
import styles from './GoalsList.module.css';

interface GoalsListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => Promise<void>;
}

export const GoalsList: React.FC<GoalsListProps> = ({ goals, onEdit, onDelete }) => {
  if (goals.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nenhuma meta encontrada</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => onEdit(goal)}
          onDelete={() => onDelete(goal.id)}
        />
      ))}
    </div>
  );
};