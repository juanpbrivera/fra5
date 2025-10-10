import { WebConfig, BrowserName, ScreenshotMode } from "./types";

/**
 * Valida y convierte el modo de screenshot desde variable de entorno.
 */
function getScreenshotModeFromEnv(value?: string): ScreenshotMode {
    const normalized = value?.toLowerCase();
    
    if (normalized === 'always' || normalized === 'off') {
        return normalized;
    }
    
    return 'on-failure'; // Default seguro
}

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

export const DefaultConfig: WebConfig = {
    env: process.env.ENV ?? "desa",
    baseUrl: process.env.BASE_URL ?? "https://example.com",
    browser: getBrowserFromEnv(process.env.BROWSER),
    headless: process.env.CI === "true" || process.env.HEADLESS === "true",
    trace: getTraceFromEnv(process.env.TRACE),
    video: process.env.VIDEO === "true",
    screenshotOnFailure: true,
    
    /**
     * Modo de captura de screenshots.
     * 
     * Variables de entorno:
     * - SCREENSHOT_MODE=always    -> Captura en cada step
     * - SCREENSHOT_MODE=on-failure -> Solo cuando falla (default)
     * - SCREENSHOT_MODE=off       -> No captura
     */
    screenshotMode: getScreenshotModeFromEnv(process.env.SCREENSHOT_MODE),
    
    timeout: 30000,

    contextOptions: {
        viewport: { width: 1366, height: 768 },
        locale: "es-PE",
        storageStatePath: process.env.STORAGE_STATE
    }
};