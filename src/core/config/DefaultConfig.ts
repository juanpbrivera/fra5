import { WebConfig, BrowserName, ScreenshotMode } from "./types";

function getBrowserFromEnv(value?: string): BrowserName {
    const normalized = value?.toLowerCase();
    if (normalized === 'firefox' || normalized === 'webkit') {
        return normalized;
    }
    return 'chromium';
}

function getTraceFromEnv(value?: string): 'on' | 'off' | 'retain-on-failure' {
    const normalized = value?.toLowerCase();
    if (normalized === 'on' || normalized === 'off') {
        return normalized;
    }
    return 'retain-on-failure';
}

function getScreenshotModeFromEnv(value?: string): ScreenshotMode {
    const normalized = value?.toLowerCase();
    if (normalized === 'always' || normalized === 'off') {
        return normalized;
    }
    return 'on-failure';
}

function getTimeoutFromEnv(): number {
    const envTimeout = process.env.TIMEOUT;
    if (envTimeout) {
        const parsed = parseInt(envTimeout, 10);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return 60000;
}

/**
 * Configuración por defecto del framework de automatización web.
 * 
 * Variables de entorno soportadas:
 * - ENV: Ambiente ('cert' | 'desa' | 'prod' | 'local')
 * - BASE_URL: URL base de la aplicación
 * - BROWSER: Navegador ('chromium' | 'firefox' | 'webkit')
 * - CI: Modo CI/CD ('true' fuerza headless)
 * - HEADLESS: Forzar headless ('true' | 'false')
 * - TRACE: Playwright Trace ('on' | 'off' | 'retain-on-failure')
 * - VIDEO: Grabación de video ('true' | 'false')
 * - SCREENSHOT_MODE: Modo de screenshots ('on-failure' | 'always' | 'off')
 * - TIMEOUT: Timeout base en ms (default: 60000)
 * - STORAGE_STATE: Ruta a archivo de autenticación
 */
export const DefaultConfig: WebConfig = {
    env: process.env.ENV ?? "desa",
    baseUrl: process.env.BASE_URL ?? "https://example.com",
    browser: getBrowserFromEnv(process.env.BROWSER),
    headless: process.env.CI === "true" || process.env.HEADLESS === "true",
    trace: getTraceFromEnv(process.env.TRACE),
    video: process.env.VIDEO === "true",
    screenshotMode: getScreenshotModeFromEnv(process.env.SCREENSHOT_MODE),
    timeout: getTimeoutFromEnv(),
    
    timeoutMultipliers: {
        playwright: 0.83,
        assertion: 0.75,
        step: 0.50
    },
    
    contextOptions: {
        viewport: { width: 1366, height: 768 },
        locale: "es-PE",
        storageStatePath: process.env.STORAGE_STATE
    }
};