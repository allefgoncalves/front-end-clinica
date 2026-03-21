// src/features/dashboard/components/SalesChart/SalesChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { SalesByDay } from '../../types/dashboard.types';
import styles from './SalesChart.module.css';

interface SalesChartProps {
  data: SalesByDay[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={styles.chart}>
      <h3>📈 Vendas por Dia</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sidebarBorder)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--textSecondary)"
            />
            <YAxis 
              yAxisId="left"
              stroke="var(--textSecondary)"
              tickFormatter={formatCurrency}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="var(--textSecondary)"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--sidebar)',
                border: '1px solid var(--sidebarBorder)',
                borderRadius: '8px',
                color: 'var(--textPrimary)'
              }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--success)" 
              name="Receita"
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="count" 
              stroke="var(--info)" 
              name="Vendas"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};