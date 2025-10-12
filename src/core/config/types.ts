export type BrowserName = "chromium" | "firefox" | "webkit";
export type ScreenshotMode = "on-failure" | "always" | "off";

/**
 * Multiplicadores para calcular timeouts jerárquicos.
 * 
 * El timeout base (cucumber) es el más grande (100%).
 * Los demás se calculan como porcentaje del base.
 */
export interface TimeoutMultipliers {
    /**
     * Multiplicador para Playwright (navegación, esperas de elementos).
     * @default 0.83 (83% del timeout de Cucumber)
     * @example Si cucumber = 60000ms, playwright = 50000ms
     */
    playwright: number;
    
    /**
     * Multiplicador para Assertions (expect, verificaciones).
     * @default 0.75 (75% del timeout de Cucumber)
     * @example Si cucumber = 60000ms, assertion = 45000ms
     */
    assertion: number;
    
    /**
     * Multiplicador para Steps individuales (acciones cortas).
     * @default 0.5 (50% del timeout de Cucumber)
     * @example Si cucumber = 60000ms, step = 30000ms
     */
    step: number;
}

export interface WebConfig {
    env: string;
    baseUrl: string;
    browser: BrowserName;
    headless: boolean;
    trace: "on" | "off" | "retain-on-failure";
    video: boolean;
    screenshotOnFailure: boolean;
    screenshotMode: ScreenshotMode;
    
    /**
     * Timeout base en milisegundos.
     * 
     * Este es el timeout de Cucumber (el más grande).
     * Los demás timeouts se calculan automáticamente usando multiplicadores.
     * 
     * @default 60000 (60 segundos)
     * @env TIMEOUT
     * 
     * @example
     * ```json
     * {
     *   "timeout": 60000  // ← Define uno solo
     * }
     * 
     * // Se calcula automáticamente:
     * // Cucumber:   60000ms (100%)
     * // Playwright: 50000ms (83%)
     * // Assertion:  45000ms (75%)
     * ```
     */
    timeout: number;
    
    /**
     * Multiplicadores para calcular timeouts jerárquicos.
     * Opcional - si no se proporciona, usa valores por defecto.
     * 
     * @default { playwright: 0.83, assertion: 0.75, step: 0.5 }
     */
    timeoutMultipliers?: TimeoutMultipliers;
    
    contextOptions?: {
        viewport?: { width: number; height: number };
        locale?: string;
        geolocation?: { latitude: number; longitude: number };
        permissions?: string[];
        storageStatePath?: string;
    };
}