// src/core/components/Layout/Layout.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  const { user, logout, tenant, branding, hasPermission } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoMenuOpen, setLogoMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const logoMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserMenuOpen(false);
    setNotificationsOpen(false);
    setLogoMenuOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (logoMenuRef.current && !logoMenuRef.current.contains(event.target as Node)) {
        setLogoMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const root = document.documentElement;

    if (branding.primary_color) {
      root.style.setProperty('--accent', branding.primary_color);
    } else {
      root.style.removeProperty('--accent');
    }

    if (branding.secondary_color) {
      root.style.setProperty('--sidebar', branding.secondary_color);
      root.style.setProperty('--navHover', branding.secondary_color);
    } else {
      root.style.removeProperty('--sidebar');
      root.style.removeProperty('--navHover');
    }
  }, [branding]);

  const notifications = [
    { id: 1, type: 'low-stock', title: 'Estoque Baixo', message: 'Óleo Essencial Lavanda com apenas 5 unidades', time: '5 min' },
    { id: 2, type: 'expiring', title: 'Produto Vencendo', message: 'Creme Corporal vence em 3 dias', time: '1 hora' },
    { id: 3, type: 'new-order', title: 'Novo Pedido', message: 'Novo agendamento confirmado', time: '2 horas' },
  ];

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', permission: 'dashboard:view' },
    { path: '/services', label: 'Serviços', icon: '💆', permission: 'services:view' },
    { path: '/products', label: 'Produtos', icon: '📦', permission: 'products:view' },
    { path: '/appointments', label: 'Agendamentos', icon: '📅', permission: 'appointments:view' },
    { path: '/carts', label: 'Carrinhos', icon: '🛒', permission: 'carts:view' },
    { path: '/promotions', label: 'Promoções', icon: '🎯', permission: 'promotions:view' },
    { path: '/sales', label: 'Vendas', icon: '💰', permission: 'sales:view' },
    { path: '/goals', label: 'Metas', icon: '🎖️', permission: 'goals:view' },
  ];

  const currentPageLabel = navItems.find(item => item.path === location.pathname)?.label || 'Painel';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo} ref={logoMenuRef}>
            <button
              className={styles.logoButton}
              onClick={() => setLogoMenuOpen(!logoMenuOpen)}
              title="Menu de Navegação"
            >
              <img 
                src={branding.logo || logo} 
                alt={tenant?.name ? `${tenant.name} logo` : 'Prover Logo'} 
                className={styles.logoImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className={styles.logoText}>{tenant?.name || 'Prover'}</span>
            </button>

            {logoMenuOpen && (
              <div className={styles.logoDropdown}>
                {navItems
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${styles.logoDropdownItem} ${
                        location.pathname === item.path ? styles.active : ''
                      }`}
                      onClick={() => setLogoMenuOpen(false)}
                    >
                      <span className={styles.logoDropdownLabel}>{item.label}</span>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          <div className={styles.navContainer}>
            <nav className={styles.nav}>
              {navItems
                .filter((item) => hasPermission(item.permission))
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${styles.navLink} ${
                      location.pathname === item.path ? styles.active : ''
                    }`}
                    title={item.label}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                ))}
            </nav>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button 
            onClick={toggleTheme} 
            className={styles.themeToggle}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div className={styles.notificationsContainer} ref={notificationsRef}>
            <button
              className={styles.notificationBell}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notificações"
            >
              🔔
              {notifications.length > 0 && (
                <span className={styles.notificationBadge}>{notifications.length}</span>
              )}
            </button>

            {notificationsOpen && (
              <div className={styles.notificationsDropdown}>
                <div className={styles.notificationsHeader}>Notificações</div>
                <div className={styles.notificationsList}>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} className={`${styles.notificationItem} ${styles[notif.type]}`}>
                        <div className={styles.notifContent}>
                          <div className={styles.notifTitle}>{notif.title}</div>
                          <div className={styles.notifMessage}>{notif.message}</div>
                        </div>
                        <div className={styles.notifTime}>{notif.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noNotifications}>Sem notificações</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.userMenuContainer} ref={userMenuRef}>
            <button
              className={styles.userAvatar}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={user?.name || 'Administrador'}
            >
              {user?.name?.charAt(0) || 'A'}
            </button>

            {userMenuOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.userDropdownHeader}>
                  <div className={styles.userDropdownAvatar}>
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className={styles.userDropdownInfo}>
                    <div className={styles.userDropdownName}>{user?.name || 'Administrador'}</div>
                    <div className={styles.userDropdownEmail}>{user?.email || 'admin@prover.com'}</div>
                  </div>
                </div>

                <div className={styles.userDropdownDivider}></div>

                <button className={styles.userDropdownButton}>
                  ⚙️ Configurações
                </button>

                <button 
                  className={styles.userDropdownButton + ' ' + styles.logout}
                  onClick={handleLogout}
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;