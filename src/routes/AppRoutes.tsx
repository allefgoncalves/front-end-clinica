// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../features/auth/pages/Login';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { Products } from '../features/products/pages/Products';
import { Services } from '../features/services/pages/Services';
import { Appointments } from '../features/appointments/pages/Appointments';
import { Carts } from '../features/carts/pages/Carts';
import { Promotions } from '../features/promotions/pages/Promotions';
import { Sales } from '../features/sales/pages/Sales';
import Layout from '../core/components/Layout/Layout';
import { Outlet } from 'react-router-dom';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/sales" element={<Sales />} />
        </Route>
      </Route>
    </Routes>
  );
};