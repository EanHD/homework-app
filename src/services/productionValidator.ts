import { getRuntimeConfig } from '@/config';
import { validateConfig, type AppConfig, type ConfigValidationResult } from '@/models/config.enhanced';

/**
 * Production Environment Validation Service
 * 
 * Validates runtime configuration, external service connectivity,
 * and critical environment setup for v1 production deployment.
 */

export interface ProductionHealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ProductionValidationResult {
  overall: 'healthy' | 'degraded' | 'critical';
  checks: ProductionHealthCheck[];
  config: ConfigValidationResult;
  environment: {
    isProduction: boolean;
    buildDate?: string;
    version?: string;
  };
}

// Health check implementations
async function checkSupabaseConnectivity(): Promise<ProductionHealthCheck> {
  const start = Date.now();
  try {
    const config = await getRuntimeConfig();
    const supabaseUrl = (config as any).supabaseUrl;
    const supabaseAnonKey = (config as any).supabaseAnonKey;
    
    if (!supabaseUrl) {
      return {
        name: 'supabase-config',
        status: 'fail',
        message: 'Supabase URL not configured',
        timestamp: new Date().toISOString(),
      };
    }

    // Test basic connectivity (health endpoint)
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey || '',
      },
    });

    const duration = Date.now() - start;
    return {
      name: 'supabase-connectivity',
      status: response.ok ? 'pass' : 'fail',
      message: response.ok 
        ? `Supabase reachable (${duration}ms)` 
        : `Supabase unreachable: ${response.status}`,
      details: {
        status: response.status,
        duration,
        url: supabaseUrl,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'supabase-connectivity',
      status: 'fail',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkPushNotificationConfig(): Promise<ProductionHealthCheck> {
  try {
    const config = await getRuntimeConfig();
    
    if (!config.vapidPublic) {
      return {
        name: 'push-notifications',
        status: 'warn',
        message: 'VAPID public key not configured - push notifications disabled',
        timestamp: new Date().toISOString(),
      };
    }

    // Validate VAPID key format (base64url, ~65 chars)
    const vapidValid = /^[A-Za-z0-9_-]{64,}$/.test(config.vapidPublic);
    
    return {
      name: 'push-notifications',
      status: vapidValid ? 'pass' : 'fail',
      message: vapidValid 
        ? 'VAPID configuration valid' 
        : 'VAPID public key format invalid',
      details: {
        vapidLength: config.vapidPublic.length,
        functionsBase: config.functionsBase,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'push-notifications',
      status: 'fail',
      message: `Push config check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkServiceWorkerRegistration(): Promise<ProductionHealthCheck> {
  try {
    if (!('serviceWorker' in navigator)) {
      return {
        name: 'service-worker',
        status: 'warn',
        message: 'Service Worker not supported in this browser',
        timestamp: new Date().toISOString(),
      };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      name: 'service-worker',
      status: registration ? 'pass' : 'warn',
      message: registration 
        ? 'Service Worker registered' 
        : 'Service Worker not registered',
      details: {
        active: !!registration?.active,
        scope: registration?.scope,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'service-worker',
      status: 'fail',
      message: `Service Worker check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkBuildEnvironment(): Promise<ProductionHealthCheck> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = import.meta.env?.DEV;
  
  // In production, we shouldn't have dev mode enabled
  const status = isProduction && !isDevelopment ? 'pass' : 'warn';
  
  return {
    name: 'build-environment',
    status,
    message: isProduction 
      ? 'Production build detected' 
      : 'Development build detected',
    details: {
      NODE_ENV: process.env.NODE_ENV,
      isDev: isDevelopment,
      mode: import.meta.env?.MODE,
    },
    timestamp: new Date().toISOString(),
  };
}

// Main validation function
export async function validateProductionEnvironment(): Promise<ProductionValidationResult> {
  // Run all health checks in parallel
  const [
    supabaseCheck,
    pushCheck,
    swCheck,
    buildCheck,
  ] = await Promise.all([
    checkSupabaseConnectivity(),
    checkPushNotificationConfig(),
    checkServiceWorkerRegistration(),
    checkBuildEnvironment(),
  ]);

  const checks = [supabaseCheck, pushCheck, swCheck, buildCheck];

  // Validate configuration using existing model validator
  let configValidation: ConfigValidationResult;
  try {
    const runtimeConfig = await getRuntimeConfig();
    // Convert runtime config to AppConfig format for validation
    const appConfig: Partial<AppConfig> = {
      supabaseUrl: (runtimeConfig as any).supabaseUrl || '',
      supabaseAnonKey: (runtimeConfig as any).supabaseAnonKey || '',
      // Add other fields as needed
    };
    configValidation = validateConfig(appConfig as AppConfig);
  } catch (error) {
    configValidation = {
      valid: false,
      errors: [{
        field: 'runtime',
        message: `Config validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CONFIG_LOAD_ERROR',
      }],
      warnings: [],
    };
  }

  // Determine overall health
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;
  
  let overall: 'healthy' | 'degraded' | 'critical';
  if (failCount > 0 || !configValidation.valid) {
    overall = 'critical';
  } else if (warnCount > 1) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }

  return {
    overall,
    checks,
    config: configValidation,
    environment: {
      isProduction: process.env.NODE_ENV === 'production',
      buildDate: import.meta.env?.VITE_BUILD_DATE,
      version: import.meta.env?.VITE_APP_VERSION || '1.0.0',
    },
  };
}

// Convenience function for quick health check
export async function isProductionReady(): Promise<boolean> {
  const result = await validateProductionEnvironment();
  return result.overall !== 'critical';
}

// Export for use in Settings page or startup validation
export const ProductionValidator = {
  validate: validateProductionEnvironment,
  isReady: isProductionReady,
  checkSupabase: checkSupabaseConnectivity,
  checkPushNotifications: checkPushNotificationConfig,
  checkServiceWorker: checkServiceWorkerRegistration,
  checkBuildEnvironment,
};

export default ProductionValidator;