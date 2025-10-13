export type BrowserName = "chromium" | "firefox" | "webkit";
export type ScreenshotMode = "on-failure" | "always" | "off";

export interface TimeoutMultipliers {
    playwright: number;
    assertion: number;
    step: number;
}

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
     * ✅ Data de prueba.
     * 
     * @example
     * ```json
     * "dataPrueba": {
     *   "usuario": "abc@banbif.com.pe",
     *   "password": "abc123",
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