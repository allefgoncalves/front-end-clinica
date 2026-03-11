// src/features/dashboard/pages/Dashboard/Dashboard.tsx
import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>📊 Dashboard</h1>
      <p>Bem-vindo ao painel administrativo!</p>
    </div>
  );
};

export default Dashboard;