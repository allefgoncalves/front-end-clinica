// src/core/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { User, TenantConfig } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  tenant: { id: string; tenant_id?: string; name?: string; slug?: string } | null;
  branding: TenantConfig['branding'];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadTenantContext: (tenantId?: string | null) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  checkAuth: () => boolean;
}

const initialBranding: TenantConfig['branding'] = {
  logo: null,
  primary_color: null,
  secondary_color: null,
};

const clearAuthStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('auth-storage');
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tenant: null,
      branding: initialBranding,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await api.post('/auth/login', {
            email,
            password,
          });

          const { access_token, refresh_token, user } = response.data;

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          // decode token to extract tenant_id (backend includes tenant_id in JWT payload)
          const decodeJwt = (token: string) => {
            try {
              const parts = token.split('.');
              if (parts.length !== 3) return null;
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              return payload;
            } catch (e) {
              return null;
            }
          };

          const payload = decodeJwt(access_token);
          const tenantId = payload?.tenant_id || null;

          if (tenantId) {
            localStorage.setItem('tenant_id', tenantId);
          }

          // fetch the authoritative user via backend (/auth/me)
          let currentUser = user;
          try {
            const meResp = await api.get('/auth/me');
            currentUser = meResp.data;
          } catch (meErr) {
            // fallback to returned user if /auth/me fails
            console.warn('Falha ao carregar /auth/me, usando usuário retornado no login.');
          }

          const derivePermissions = (u: User | null) => {
            if (!u) return [] as string[];
            if (u.role === 'admin') return ['*'];
            return [] as string[];
          };

          set({
            user: currentUser,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            permissions: derivePermissions(currentUser),
          });

          // load tenant context only when we have a tenantId
          if (tenantId) {
            await get().loadTenantContext(tenantId);
          }
        } catch (error) {
          console.error('Erro no login:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        // attempt to notify backend (best-effort)
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            api.post('/auth/logout').catch(() => {});
          }
        } catch (e) {
          // ignore
        }

        clearAuthStorage();
        localStorage.removeItem('theme');
        delete api.defaults.headers.common['Authorization'];

        set({
          user: null,
          token: null,
          tenant: null,
          branding: initialBranding,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      // load tenant config from backend using explicit tenant_id
      loadTenantContext: async (tenantId?: string | null) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Prefer the centralized endpoint `/tenants/config` for tenant context
        try {
          const response = await api.get<any>('/tenants/config');
          const cfg = response.data;

          // Support two possible backend shapes:
          // 1) { tenant: { id, name, slug, ... }, branding: {...}, settings: {...}, permissions: [...] }
          // 2) { id, tenant_id, branding: {...}, settings: {...} }

          let tenantObj: any = null;
          if (cfg && cfg.tenant) {
            tenantObj = cfg.tenant;
          } else if (cfg && (cfg.tenant_id || cfg.id)) {
            tenantObj = { id: cfg.tenant_id || cfg.id, name: cfg.name, slug: cfg.slug };
          }

          const branding = cfg.branding ?? {};
          const permissions = Array.isArray(cfg.permissions) ? cfg.permissions : get().permissions || [];

          if (tenantObj?.id) {
            localStorage.setItem('tenant_id', tenantObj.id);
          }

          set({
            tenant: tenantObj ? { id: tenantObj.id, tenant_id: tenantObj.id, name: tenantObj.name, slug: tenantObj.slug } : null,
            branding: {
              logo: branding?.logo ?? null,
              primary_color: branding?.primary_color ?? null,
              secondary_color: branding?.secondary_color ?? null,
            },
            permissions,
          });
        } catch (error) {
          console.error('Erro ao carregar TenantConfig:', error);
          // do not keep a stale session if tenant config fails validation
          get().logout();
          throw error;
        }
      },

      hasPermission: (permission: string) => {
        if (!permission) return true;
        const perms = get().permissions || [];
        if (perms.includes('*')) return true;
        const user = get().user;
        if (user?.role === 'admin') return true;
        return perms.includes(permission);
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('access_token');
        const state = get();

        if (token && state.user) {
          if (!api.defaults.headers.common['Authorization']) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }

          if (!state.tenant || !state.permissions.length) {
            // ensure we have the authoritative user and tenant config
            (async () => {
              try {
                // refresh user from /auth/me
                const meResp = await api.get('/auth/me');
                const derivePermissions = (u: User | null) => {
                  if (!u) return [] as string[];
                  if (u.role === 'admin') return ['*'];
                  return [] as string[];
                };
                set({ user: meResp.data, isAuthenticated: true, permissions: derivePermissions(meResp.data) });

                // decode token to extract tenant_id if needed
                const parts = token.split('.');
                let tenantId: string | null = null;
                try {
                  if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    tenantId = payload?.tenant_id || null;
                    if (tenantId) localStorage.setItem('tenant_id', tenantId);
                  }
                } catch (e) {
                  // ignore
                }

                if (tenantId) {
                  await get().loadTenantContext(tenantId);
                }
              } catch (e) {
                // problema de tenant será tratado por loadTenantContext
              }
            })();
          }

          return true;
        }

        return false;
      }
    }),
    {
      name: 'auth-storage', // nome da storage no localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tenant: state.tenant,
        branding: state.branding,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Inicializar verificação de autenticação
useAuthStore.getState().checkAuth();