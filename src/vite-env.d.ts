// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_TOKEN_KEY: string
  readonly VITE_REFRESH_TOKEN_KEY: string
  readonly VITE_USER_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_ENABLE_WHATSAPP: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_DEFAULT_THEME: 'light' | 'dark' | 'system'
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_MAX_PAGE_SIZE: string
  readonly VITE_LOW_STOCK_THRESHOLD: string
  readonly VITE_EXPIRY_WARNING_DAYS: string
  readonly VITE_BUSINESS_HOURS_START: string
  readonly VITE_BUSINESS_HOURS_END: string
  readonly VITE_MIN_ADVANCE_HOURS: string
  readonly VITE_MAX_IMAGE_SIZE: string
  readonly VITE_ALLOWED_IMAGE_TYPES: string
  readonly VITE_CONTACT_PHONE: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}