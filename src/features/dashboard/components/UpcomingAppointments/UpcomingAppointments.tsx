// src/features/dashboard/components/UpcomingAppointments/UpcomingAppointments.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppointmentItem } from '../../types/dashboard.types';
import styles from './UpcomingAppointments.module.css';

interface UpcomingAppointmentsProps {
  appointments: AppointmentItem[];
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  if (appointments.length === 0) {
    return null;
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>📋 Próximos Agendamentos</h3>
        <Link to="/appointments" className={styles.viewAll}>Ver todos</Link>
      </div>
      <div className={styles.list}>
        {appointments.map(apt => (
          <div key={apt.id} className={styles.item}>
            <span className={styles.time}>{formatTime(apt.time)}</span>
            <span className={styles.client}>{apt.client}</span>
            <span className={styles.service}>{apt.service}</span>
            <span className={`${styles.status} ${styles[apt.status]}`}>
              {apt.status === 'confirmed' ? '✅' : '⏳'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};