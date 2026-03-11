import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../styles/ThemeProvider';
import styles from './Layout.module.css';
import logo from '../../../../public/imagens/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/services', label: 'Serviços' },
    { path: '/products', label: 'Produtos' },
    { path: '/appointments', label: 'Agendamentos' },
    { path: '/carts', label: 'Carrinhos' },
    { path: '/promotions', label: 'Promoções' },
    { path: '/sales', label: 'Vendas' },
  ];

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoWrapper}>
            <img 
              src={logo} 
              alt="Prover Logo" 
              className={styles.logoImage}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className={styles.logoText}>Prover</span>
          </div>
          
          <button 
            onClick={toggleTheme} 
            className={styles.themeToggle}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${
                location.pathname === item.path ? styles.active : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.name || 'Administrador'}</div>
              <div className={styles.userEmail}>{user?.email || 'admin@prover.com'}</div>
            </div>
          </div>
          
          <button onClick={handleLogout} className={styles.logoutButton}>
            Sair
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;