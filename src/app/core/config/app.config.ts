/**
 * Configuración global de la aplicación
 */

export const APP_CONFIG = {
  app: {
    name: 'SIAF-RP',
    version: '0.1.0',
    environment: 'development',
  },
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  features: {
    darkMode: true,
    multiLanguage: false,
    analytics: false,
  },
  logging: {
    enabled: true,
    level: 'info',
  },
};

export const ROUTES_CONFIG = {
  public: ['/login', '/forgot-password', '/reset-password'],
  protected: ['/panel', '/dashboard', '/documents'],
};
