// src/features/dashboard/components/StatusPieChart/StatusPieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusCount } from '../../types/dashboard.types';
import styles from './StatusPieChart.module.css';

interface StatusPieChartProps {
  data: StatusCount;
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Pendente', value: data.pending, color: 'var(--warning)' },
    { name: 'Pago', value: data.paid, color: 'var(--success)' },
    { name: 'Separado', value: data.separated, color: 'var(--info)' },
    { name: 'Entregue', value: data.delivered, color: 'var(--accent)' },
    { name: 'Cancelado', value: data.cancelled, color: 'var(--danger)' }
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCenterContent = () => {
    return (
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        dominantBaseline="middle"
        className={styles.centerText}
      >
        <tspan x="50%" dy="-0.5em" className={styles.centerTotal}>
          {total}
        </tspan>
        <tspan x="50%" dy="2.7em" className={styles.centerLabel}>
          Total
        </tspan>
      </text>
    );
  };

  return (
    <div className={styles.chart}>
      <h3>🥧 Status das Vendas</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            {renderCenterContent()}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--sidebar)',
                border: '1px solid var(--sidebarBorder)',
                borderRadius: '8px',
                color: 'var(--textPrimary)'
              }}
              formatter={(value: number | undefined) => [`${value || 0} vendas`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legendColumn}>
        {chartData.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <span 
              className={styles.legendColor} 
              style={{ backgroundColor: item.color }}
            ></span>
            <span className={styles.legendName}>{item.name}</span>
            <span className={styles.legendValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};