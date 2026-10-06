// Central types for frontend aligned with backend contract

export interface TenantConfig {
  id: string;
  tenant_id: string;
  branding: {
    name?: string;
    logo?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
  };
  settings?: {
    timezone?: string;
    language?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  picture?: string | null;
}
