import { WebConfig, BrowserName } from "./types";

/**
 * Configuración por defecto del framework de automatización web.
 * 
 * Esta es la configuración base (nivel 1) que se usa cuando:
 * - No existe archivo JSON del ambiente
 * - El archivo JSON no define alguna propiedad específica
 * 
 * Prioridad de configuración:
 * 1. DefaultConfig (este archivo) ← Más baja
 * 2. Archivo JSON (cert.json, desa.json)
 * 3. Variables de entorno (process.env)
 * 4. BrowserOptions (parámetros en runtime) ← Más alta
 * 
 * Variables de entorno soportadas:
 * - ENV: Nombre del ambiente ('cert' | 'desa' | 'prod' | 'local')
 * - BASE_URL: URL base de la aplicación a testear
 * - BROWSER: Navegador a usar ('chromium' | 'firefox' | 'webkit')
 * - CI: Si está en modo CI/CD ('true' fuerza headless)
 * - HEADLESS: Forzar modo headless ('true' | 'false')
 * - TRACE: Configuración de Playwright Trace ('on' | 'off' | 'retain-on-failure')
 * - VIDEO: Habilitar grabación de video ('true' | 'false')
 * - STORAGE_STATE: Ruta a archivo de estado de autenticación (ej: 'auth.json')
 * 
 * @example
 * ```bash
 * # Ejecutar en ambiente de desarrollo con Firefox
 * ENV=desa BROWSER=firefox npm test
 * 
 * # Ejecutar en CI con videos
 * CI=true VIDEO=true npm test
 * 
 * # Usar sesión guardada
 * STORAGE_STATE=auth-admin.json npm test
 * ```
 */

/**
 * Valida y convierte el nombre del navegador desde variable de entorno.
 * 
 * @param value - Valor desde process.env.BROWSER
 * @returns Nombre válido de navegador
 */
function getBrowserFromEnv(value?: string): BrowserName {
    const normalized = value?.toLowerCase();
    
    if (normalized === 'firefox' || normalized === 'webkit') {
        return normalized;
    }
    
    return 'chromium'; // Default seguro
}

/**
 * Valida y convierte la configuración de trace desde variable de entorno.
 * 
 * @param value - Valor desde process.env.TRACE
 * @returns Configuración válida de trace
 */
function getTraceFromEnv(value?: string): 'on' | 'off' | 'retain-on-failure' {
    const normalized = value?.toLowerCase();
    
    if (normalized === 'on' || normalized === 'off') {
        return normalized;
    }
    
    return 'retain-on-failure'; // Default seguro
}

/**
 * Configuración por defecto del framework.
 * Se combina con archivos JSON del ambiente mediante ConfigManager.
 */
export const DefaultConfig: WebConfig = {
    /**
     * Ambiente de ejecución.
     * @default 'desa'
     * @env ENV
     */
    env: process.env.ENV ?? "desa",

    /**
     * URL base de la aplicación a testear.
     * Usado por BrowserFactory.gotoBaseUrl()
     * 
     * @default 'https://example.com'
     * @env BASE_URL
     * 
     * @example
     * ```typescript
     * // Navega a https://example.com/login
     * await BrowserFactory.gotoBaseUrl(page, '/login');
     * ```
     */
    baseUrl: process.env.BASE_URL ?? "https://example.com",

    /**
     * Navegador a utilizar para las pruebas.
     * 
     * @default 'chromium'
     * @env BROWSER
     */
    browser: getBrowserFromEnv(process.env.BROWSER),

    /**
     * Modo headless (sin interfaz gráfica).
     * 
     * Se activa automáticamente si:
     * - CI=true (modo CI/CD)
     * - HEADLESS=true (forzado manualmente)
     * 
     * @default false (excepto en CI)
     * @env CI, HEADLESS
     */
    headless: process.env.CI === "true" || process.env.HEADLESS === "true",

    /**
     * Configuración de Playwright Trace para debugging.
     * 
     * - 'on': Siempre captura trace (mayor overhead)
     * - 'off': Nunca captura trace
     * - 'retain-on-failure': Solo guarda si el test falla (recomendado)
     * 
     * Los traces se guardan en ./artifacts/trace-{timestamp}.zip
     * Visualiza en: https://trace.playwright.dev
     * 
     * @default 'retain-on-failure'
     * @env TRACE
     */
    trace: getTraceFromEnv(process.env.TRACE),

    /**
     * Habilita grabación de video de la ejecución.
     * 
     * Los videos se guardan en ./videos/
     * ⚠️ Impacta performance significativamente
     * 
     * @default false
     * @env VIDEO
     */
    video: process.env.VIDEO === "true",

    /**
     * Captura screenshot automático cuando un test falla.
     * 
     * Screenshots se guardan en ./artifacts/
     * Usado por ReportingInterceptor para el reporte Word.
     * 
     * @default true
     */
    screenshotOnFailure: true,

    timeout: 30000,

    /**
     * Opciones del contexto de navegación de Playwright.
     * 
     * Configura aspectos como viewport, locale, permisos, etc.
     */
    contextOptions: {
        /**
         * Tamaño de la ventana del navegador.
         * 
         * @default { width: 1366, height: 768 } (laptop estándar)
         */
        viewport: { width: 1366, height: 768 },

        /**
         * Idioma del navegador.
         * Afecta navigator.language y headers Accept-Language.
         * 
         * @default 'es-PE' (Español - Perú)
         */
        locale: "es-PE",

        /**
         * Ruta al archivo de estado de autenticación.
         * 
         * Permite reutilizar sesiones entre tests sin re-autenticarse.
         * 
         * @default undefined
         * @env STORAGE_STATE
         * 
         * @example
         * ```bash
         * # Guardar sesión
         * await context.storageState({ path: 'auth.json' });
         * 
         * # Reutilizar sesión
         * STORAGE_STATE=auth.json npm test
         * ```
         */
        storageStatePath: process.env.STORAGE_STATE
    }
};