// src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../core/store/authStore';

interface PrivateRouteProps {
  permission?: string;
}

export const PrivateRoute = ({ permission }: PrivateRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!isAuthenticated) {
    // If there's a token in storage but auth state not yet populated, wait briefly
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      return <div>Carregando sessão...</div>;
    }

    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};