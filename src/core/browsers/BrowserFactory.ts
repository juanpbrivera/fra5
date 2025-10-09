import { chromium, firefox, webkit, Browser, BrowserContext, Page, BrowserType } from "@playwright/test";
import { ConfigManager } from "../config/ConfigManager";
import { BrowserOptions } from "./BrowserOptions";
import { LoggerFactory } from "../logging/LoggerFactory";
import { BrowserName } from "../config/types";

/**
 * Factory para la gestión centralizada de navegadores Playwright.
 * 
 * Responsabilidades:
 * - Lanzar navegadores con configuración personalizada
 * - Gestionar contextos de navegación (videos, traces, storage state)
 * - Navegar a URLs base configuradas
 * - Cierre limpio de recursos
 * 
 * @example
 * ```typescript
 * const { browser, context, page } = await BrowserFactory.launch();
 * await BrowserFactory.gotoBaseUrl(page, '/login');
 * await BrowserFactory.stop(context);
 * ```
 */
export class BrowserFactory {
    private static readonly logger = LoggerFactory.getLogger("BrowserFactory");

    /**
     * Obtiene el tipo de navegador según el nombre configurado.
     * 
     * @param name - Nombre del navegador ('chromium' | 'firefox' | 'webkit')
     * @returns BrowserType para lanzar el navegador
     * @private
     */
    private static getBrowserType(name: BrowserName): BrowserType<Browser> {
        switch (name) {
            case "firefox":
                return firefox;
            case "webkit":
                return webkit;
            default:
                return chromium;
        }
    }

    /**
     * Determina si el tracing está habilitado según la configuración.
     * 
     * @param traceConfig - Configuración de trace ('on' | 'off' | 'retain-on-failure')
     * @returns true si el trace debe iniciarse/detenerse
     * @private
     */
    private static isTracingEnabled(traceConfig?: string): boolean {
        return traceConfig !== undefined && traceConfig !== "off";
    }

    /**
     * Lanza un navegador con configuración personalizada.
     * 
     * Pasos:
     * 1. Selecciona el tipo de navegador (chromium/firefox/webkit)
     * 2. Crea un contexto con opciones (viewport, locale, videos, storage state)
     * 3. Inicia tracing si está configurado
     * 4. Crea y retorna una página nueva
     * 
     * @param opts - Opciones opcionales para sobrescribir configuración por defecto
     * @returns Objeto con browser, context y page
     * 
     * @example
     * ```typescript
     * // Usar configuración por defecto
     * const { browser, context, page } = await BrowserFactory.launch();
     * 
     * // Con opciones personalizadas
     * const { browser, context, page } = await BrowserFactory.launch({
     *   headless: false,
     *   video: true
     * });
     * ```
     */
    static async launch(opts?: BrowserOptions): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
        const cfg = ConfigManager.get();

        const name = opts?.name ?? cfg.browser;
        const headless = opts?.headless ?? cfg.headless;

        const type = this.getBrowserType(name);

        this.logger.info({ name, headless }, "Iniciando el Navegador");
        const browser = await type.launch({ headless });

        const context = await browser.newContext({
            ...cfg.contextOptions,
            ...opts?.context,
            recordVideo: (cfg.video || opts?.video) ? { dir: "videos" } : undefined,
            storageState: cfg.contextOptions?.storageStatePath
        });

        if (cfg.timeout) {
            context.setDefaultTimeout(cfg.timeout);
        }
        
        const page = await context.newPage();

        if (this.isTracingEnabled(cfg.trace)) {
            await context.tracing.start({ screenshots: true, snapshots: true });
        }

        return { browser, context, page };
    }

    /**
     * Navega a una ruta relativa de la URL base configurada.
     * 
     * @param page - Página de Playwright donde navegar
     * @param relativePath - Ruta relativa (default: '/')
     * 
     * @example
     * ```typescript
     * await BrowserFactory.gotoBaseUrl(page, '/login');
     * // Navega a: https://example.com/login
     * ```
     */
    static async gotoBaseUrl(page: Page, relativePath: string = "/"): Promise<void> {
        const cfg = ConfigManager.get();
        await page.goto(new URL(relativePath, cfg.baseUrl).toString());
    }

    /**
     * Detiene el contexto del navegador y guarda artifacts si están configurados.
     * 
     * Pasos:
     * 1. Si tracing está habilitado, guarda el trace en ./artifacts/
     * 2. Cierra el contexto del navegador
     * 
     * @param context - Contexto de Playwright a cerrar
     * 
     * @example
     * ```typescript
     * await BrowserFactory.stop(context);
     * // Guarda trace en: ./artifacts/trace-1234567890.zip
     * ```
     */
    static async stop(context: BrowserContext): Promise<void> {
        const cfg = ConfigManager.get();
        
        if (this.isTracingEnabled(cfg.trace)) {
            await context.tracing.stop({ path: `./artifacts/trace-${Date.now()}.zip` });
        }
        
        await context.close();
    }
}