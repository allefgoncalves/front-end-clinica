// src/config/env.ts
interface EnvConfig {
  apiUrl: string;
  apiTimeout: number;
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  appName: string;
  appVersion: string;
  appEnv: 'development' | 'staging' | 'production';
  enableWhatsApp: boolean;
  enableNotifications: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
  defaultPageSize: number;
  maxPageSize: number;
  lowStockThreshold: number;
  expiryWarningDays: number;
  businessHoursStart: number;
  businessHoursEnd: number;
  minAdvanceHours: number;
  maxImageSize: number;
  allowedImageTypes: string[];
  contactPhone: string;
  contactEmail: string;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class Env {
  private static instance: Env;
  private config: EnvConfig;

  private constructor() {
    this.config = {
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
      apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      tokenKey: import.meta.env.VITE_TOKEN_KEY || 'access_token',
      refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
      userKey: import.meta.env.VITE_USER_KEY || 'user',
      appName: import.meta.env.VITE_APP_NAME || 'Sistema Clínica de Massagem',
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      appEnv: (import.meta.env.VITE_APP_ENV as any) || 'development',
      enableWhatsApp: import.meta.env.VITE_ENABLE_WHATSAPP === 'true',
      enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
      defaultTheme: (import.meta.env.VITE_DEFAULT_THEME as any) || 'light',
      defaultPageSize: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
      maxPageSize: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
      lowStockThreshold: Number(import.meta.env.VITE_LOW_STOCK_THRESHOLD) || 5,
      expiryWarningDays: Number(import.meta.env.VITE_EXPIRY_WARNING_DAYS) || 30,
      businessHoursStart: Number(import.meta.env.VITE_BUSINESS_HOURS_START) || 8,
      businessHoursEnd: Number(import.meta.env.VITE_BUSINESS_HOURS_END) || 20,
      minAdvanceHours: Number(import.meta.env.VITE_MIN_ADVANCE_HOURS) || 2,
      maxImageSize: Number(import.meta.env.VITE_MAX_IMAGE_SIZE) || 5242880,
      allowedImageTypes: (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp').split(','),
      contactPhone: import.meta.env.VITE_CONTACT_PHONE || '',
      contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
      logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'debug',
    };
  }

  public static getInstance(): Env {
    if (!Env.instance) {
      Env.instance = new Env();
    }
    return Env.instance;
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public getAll(): EnvConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.appEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.appEnv === 'production';
  }
}

export const env = Env.getInstance();
export default env;