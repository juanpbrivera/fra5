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

/**
 * Obtiene el timeout base desde variable de entorno o usa default.
 * @returns Timeout en milisegundos
 */
function getTimeoutFromEnv(): number {
    const envTimeout = process.env.TIMEOUT;
    if (envTimeout) {
        const parsed = parseInt(envTimeout, 10);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return 60000; // Default 60 segundos
}

/**
 * Configuración por defecto del framework de automatización web.
 * 
 * TIMEOUTS:
 * Los timeouts se manejan de forma jerárquica:
 * 1. timeout (base) → Cucumber (el más grande)
 * 2. timeout * 0.83 → Playwright
 * 3. timeout * 0.75 → Assertions
 * 4. timeout * 0.50 → Steps individuales
 * 
 * Esto garantiza que cada capa tenga tiempo de dar su mensaje
 * ANTES de que la capa superior mate la promesa.
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
    screenshotOnFailure: true,
    screenshotMode: getScreenshotModeFromEnv(process.env.SCREENSHOT_MODE),
    
    /**
     * Timeout base (Cucumber).
     * 
     * Los demás timeouts se calculan automáticamente:
     * - Playwright: timeout * 0.83
     * - Assertion: timeout * 0.75
     * - Step: timeout * 0.50
     * 
     * @default 60000ms (60 segundos)
     */
    timeout: getTimeoutFromEnv(),
    
    /**
     * Multiplicadores por defecto.
     * Pueden ser sobrescritos en archivos JSON por ambiente.
     */
    timeoutMultipliers: {
        playwright: 0.83,  // 83% del timeout base
        assertion: 0.75,   // 75% del timeout base
        step: 0.50         // 50% del timeout base
    },
    
    contextOptions: {
        viewport: { width: 1366, height: 768 },
        locale: "es-PE",
        storageStatePath: process.env.STORAGE_STATE
    }
};