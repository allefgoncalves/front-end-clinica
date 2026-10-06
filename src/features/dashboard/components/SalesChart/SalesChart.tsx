// src/features/dashboard/components/SalesChart/SalesChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const dateOnly = dateStr.slice(0, 10);
    const [year, month, day] = dateOnly.split('-').map(Number);
    if ([year, month, day].every((part) => !Number.isNaN(part))) {
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const formatDate = (dateStr: string) => {
    const date = parseDate(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={styles.chart}>
      <h3>📈 Vendas por Dia</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 50, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--sidebarBorder)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--textSecondary)"
              interval="preserveStartEnd"
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
              labelFormatter={(value) => formatDate(String(value))}
              contentStyle={{ 
                backgroundColor: 'var(--sidebar)',
                border: '1px solid var(--sidebarBorder)',
                borderRadius: '8px',
                color: 'var(--textPrimary)'
              }}
            />
            <Legend />
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