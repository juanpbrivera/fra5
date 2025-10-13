export type BrowserName = "chromium" | "firefox" | "webkit";
export type ScreenshotMode = "on-failure" | "always" | "off";

export interface TimeoutMultipliers {
    playwright: number;
    assertion: number;
    step: number;
}

/**
 * Estructura de credenciales por rol.
 */
export interface Credencial {
    usuario: string;
    password: string;
}

/**
 * Configuración web del framework.
 * 
 * Soporta propiedades dinámicas para data de prueba:
 * - Credenciales
 * - Data de prueba (cuentas, montos, etc.)
 * - Cualquier configuración custom
 * 
 * @example
 * ```json
 * {
 *   "env": "cert",
 *   "baseUrl": "https://...",
 *   "credenciales": {
 *     "vendedor": { "usuario": "...", "password": "..." }
 *   },
 *   "dataPrueba": {
 *     "cuentaValida": "0011-2233-4455"
 *   }
 * }
 * ```
 */
export interface WebConfig {
    env: string;
    baseUrl: string;
    browser: BrowserName;
    headless: boolean;
    trace: "on" | "off" | "retain-on-failure";
    video: boolean;
    screenshotMode: ScreenshotMode;
    timeout: number;
    timeoutMultipliers?: TimeoutMultipliers;
    
    contextOptions?: {
        viewport?: { width: number; height: number };
        locale?: string;
        geolocation?: { latitude: number; longitude: number };
        permissions?: string[];
        storageStatePath?: string;
        timezoneId?: string;
    };
    
    /**
     * ✅ Credenciales por rol (opcional).
     * 
     * @example
     * ```json
     * "credenciales": {
     *   "vendedor": { "usuario": "...", "password": "..." },
     *   "administrador": { "usuario": "...", "password": "..." }
     * }
     * ```
     */
    credenciales?: Record<string, Credencial>;
    
    /**
     * ✅ Data de prueba (opcional).
     * 
     * @example
     * ```json
     * "dataPrueba": {
     *   "cuentaValida": "0011-2233-4455",
     *   "montoTransferencia": "100.00"
     * }
     * ```
     */
    dataPrueba?: Record<string, any>;
    
    /**
     * ✅ Permite propiedades dinámicas adicionales.
     * Útil para configuraciones custom sin modificar la interfaz.
     */
    [key: string]: any;
}