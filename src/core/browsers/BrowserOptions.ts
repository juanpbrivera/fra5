import { BrowserContextOptions } from "@playwright/test";
import { BrowserName } from "../config/types";

/**
 * Opciones de configuración para personalizar el lanzamiento de navegadores.
 * 
 * Permite sobrescribir configuraciones por defecto de ConfigManager
 * para casos específicos de testing.
 * 
 * @example
 * ```typescript
 * const options: BrowserOptions = {
 *   name: 'firefox',
 *   headless: false,
 *   video: true,
 *   trace: 'retain-on-failure'
 * };
 * 
 * const { browser, context, page } = await BrowserFactory.launch(options);
 * ```
 */
export interface BrowserOptions {
    /**
     * Tipo de navegador a utilizar.
     * 
     * @default 'chromium' (desde ConfigManager)
     * @example 'chromium' | 'firefox' | 'webkit'
     */
    name?: BrowserName;

    /**
     * Modo de ejecución del navegador.
     * 
     * - `true`: Sin interfaz gráfica (ideal para CI/CD)
     * - `false`: Con interfaz visible (ideal para debugging)
     * 
     * @default Configuración desde ConfigManager (depende de CI env)
     */
    headless?: boolean;

    /**
     * Configuración de Playwright Trace para debugging.
     * 
     * - `'on'`: Siempre captura trace
     * - `'off'`: Nunca captura trace
     * - `'retain-on-failure'`: Solo guarda trace si el test falla
     * 
     * Los traces se guardan en `./artifacts/trace-{timestamp}.zip`
     * y se pueden visualizar en https://trace.playwright.dev
     * 
     * @default 'retain-on-failure'
     */
    trace?: "on" | "off" | "retain-on-failure";

    /**
     * Habilita grabación de video de la ejecución del test.
     * 
     * Videos se guardan en `./videos/`
     * 
     * @default false
     */
    video?: boolean;

    /**
     * Opciones adicionales de BrowserContext de Playwright.
     * 
     * Permite configurar aspectos avanzados como:
     * - `viewport`: Tamaño de la ventana
     * - `locale`: Idioma del navegador
     * - `geolocation`: Ubicación simulada
     * - `permissions`: Permisos del navegador
     * - `storageState`: Estado de autenticación persistente
     * 
     * @see https://playwright.dev/docs/api/class-browser#browser-new-context
     * 
     * @example
     * ```typescript
     * context: {
     *   viewport: { width: 1920, height: 1080 },
     *   locale: 'es-PE',
     *   geolocation: { latitude: -12.0464, longitude: -77.0428 }
     * }
     * ```
     */
    context?: BrowserContextOptions;
}