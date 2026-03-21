// src/features/goals/components/GoalHistory/GoalHistory.tsx
import React, { useState, useEffect } from 'react';
import { goalsService } from '../../services/goalsService';
import { GoalsSummary } from '../../types/goals.types';
import styles from './GoalHistory.module.css';

export const GoalHistory: React.FC = () => {
  const [history, setHistory] = useState<GoalsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await goalsService.getHistory(12);
      setHistory(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatMonth = (year: number, month: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando histórico...</p>
      </div>
    );
  }

  if (!history || history.history.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nenhum histórico encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>📈 Histórico de Metas</h2>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.cell}>Período</div>
          <div className={styles.cell}>Meta Receita</div>
          <div className={styles.cell}>Atingido</div>
          <div className={styles.cell}>Progresso</div>
          <div className={styles.cell}>Meta Qtd</div>
          <div className={styles.cell}>Atingido</div>
          <div className={styles.cell}>Progresso</div>
        </div>

        <div className={styles.tableBody}>
          {history.history.map((item, index) => (
            <div key={index} className={styles.row}>
              <div className={styles.cell}>
                {formatMonth(item.year, item.month)}
              </div>
              <div className={styles.cell}>
                {formatCurrency(item.revenue_target)}
              </div>
              <div className={styles.cell}>
                {formatCurrency(item.revenue_achieved)}
              </div>
              <div className={styles.cell}>
                <div className={styles.progressContainer}>
                  <div 
                    className={styles.progressBar}
                    style={{ 
                      width: `${Math.min(item.revenue_progress, 100)}%`,
                      backgroundColor: item.revenue_progress >= 100 ? 'var(--success)' : 'var(--info)'
                    }}
                  ></div>
                  <span className={styles.progressText}>
                    {item.revenue_progress}%
                  </span>
                </div>
              </div>
              <div className={styles.cell}>
                {item.quantity_target}
              </div>
              <div className={styles.cell}>
                {item.quantity_achieved}
              </div>
              <div className={styles.cell}>
                <div className={styles.progressContainer}>
                  <div 
                    className={styles.progressBar}
                    style={{ 
                      width: `${Math.min(item.quantity_progress, 100)}%`,
                      backgroundColor: item.quantity_progress >= 100 ? 'var(--success)' : 'var(--info)'
                    }}
                  ></div>
                  <span className={styles.progressText}>
                    {item.quantity_progress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};