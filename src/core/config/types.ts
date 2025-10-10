export type BrowserName = "chromium" | "firefox" | "webkit";
export type ScreenshotMode = "on-failure" | "always" | "off";

export interface WebConfig {
    env: string; // cert | desa | prod | local
    baseUrl: string; // URL base para pruebas web
    browser: BrowserName; // navegador por defecto
    headless: boolean;
    trace: "on" | "off" | "retain-on-failure";
    video: boolean;
    screenshotOnFailure: boolean;
    
    /**
     * Modo de captura de screenshots:
     * - 'on-failure': Solo captura cuando falla (default)
     * - 'always': Captura en cada step
     * - 'off': No captura screenshots
     * 
     * @default 'on-failure'
     * @env SCREENSHOT_MODE
     */
    screenshotMode: ScreenshotMode;
    
    timeout?: number;
    contextOptions?: {
        viewport?: { width: number; height: number };
        locale?: string;
        geolocation?: { latitude: number; longitude: number };
        permissions?: string[];
        storageStatePath?: string;
    };
}