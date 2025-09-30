export type BrowserName = "chromium" | "firefox" | "webkit";


export interface WebConfig {
    env: string; // cert | desa | prod | local
    baseUrl: string; // URL base para pruebas web
    browser: BrowserName; // navegador por defecto
    headless: boolean;
    trace: "on" | "off" | "retain-on-failure";
    video: boolean;
    screenshotOnFailure: boolean;
    contextOptions?: {
        viewport?: { width: number; height: number };
        locale?: string;
        geolocation?: { latitude: number; longitude: number };
        permissions?: string[];
        storageStatePath?: string; // Ruta a storageState.json
    };
}