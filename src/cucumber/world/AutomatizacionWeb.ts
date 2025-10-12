// Framework5/src/cucumber/world/AutomatizacionWeb.ts
import { IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from '../../core/config/ConfigManager';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ScreenshotHelper } from '../../utilities/ScreenshotHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';
import { ReportingInterceptor } from '../../core/browsers/interceptors/ReportingInterceptor';
import type { Logger as PinoLogger } from 'pino';

export interface ParametrosAutomatizacion {
    ambiente?: string;
    urlBase?: string;
}

/**
 * World de Cucumber para Automatizacion web.
 * 
 * ACCESO A CONFIGURACIÓN Y LOGGING:
 * Todos los métodos de ConfigManager y LoggerFactory están
 * encapsulados aquí para mantener el API limpio.
 * 
 * @example
 * ```typescript
 * // En hooks.ts
 * import { AutomatizacionWeb } from '@automation/web-automation-framework';
 * 
 * const logger = AutomatizacionWeb.crearLogger('CucumberHooks');
 * const timeout = AutomatizacionWeb.obtenerTimeoutCucumber();
 * ```
 */
export class AutomatizacionWeb {
    private navegador!: Browser;
    private contexto!: BrowserContext;
    private pagina!: Page;
    private readonly log: PinoLogger;
    readonly parametros: ParametrosAutomatizacion;

    constructor(opciones: IWorldOptions) {
        this.parametros = (opciones.parameters as ParametrosAutomatizacion) || {};
        ConfigManager.load(this.parametros.ambiente);
        if (this.parametros.urlBase) {
            ConfigManager.override({ baseUrl: this.parametros.urlBase });
        }
        this.log = LoggerFactory.getLogger('AutomatizacionWeb');
    }

    // ===== MÉTODOS ESTÁTICOS PARA CONFIGURACIÓN =====

    /**
     * Carga la configuración del ambiente especificado.
     * Debe llamarse ANTES de cualquier otro método.
     * 
     * @param ambiente - Nombre del ambiente ('cert' | 'desa' | 'prod')
     * 
     * @example
     * ```typescript
     * // En hooks.ts (al inicio)
     * AutomatizacionWeb.cargarConfiguracion();
     * ```
     */
    static cargarConfiguracion(ambiente?: string): void {
        ConfigManager.load(ambiente);
    }

    /**
     * Obtiene el timeout de Cucumber (el más grande de la jerarquía).
     * 
     * @returns Timeout en milisegundos
     * 
     * @example
     * ```typescript
     * const timeout = AutomatizacionWeb.obtenerTimeoutCucumber();
     * setDefaultTimeout(timeout);
     * ```
     */
    static obtenerTimeoutCucumber(): number {
        return ConfigManager.getCucumberTimeout();
    }

    /**
     * Obtiene el timeout de Playwright.
     * 
     * @returns Timeout en milisegundos
     */
    static obtenerTimeoutPlaywright(): number {
        return ConfigManager.getPlaywrightTimeout();
    }

    /**
     * Obtiene el timeout de Assertions.
     * 
     * @returns Timeout en milisegundos
     */
    static obtenerTimeoutAssertion(): number {
        return ConfigManager.getAssertionTimeout();
    }

    /**
     * Obtiene el timeout de Steps.
     * 
     * @returns Timeout en milisegundos
     */
    static obtenerTimeoutStep(): number {
        return ConfigManager.getStepTimeout();
    }

    /**
     * Obtiene todos los timeouts calculados.
     * 
     * @returns Objeto con todos los timeouts
     * 
     * @example
     * ```typescript
     * const timeouts = AutomatizacionWeb.obtenerTodosLosTimeouts();
     * // { cucumber: 60000, playwright: 50000, assertion: 45000, step: 30000 }
     * ```
     */
    static obtenerTodosLosTimeouts(): {
        cucumber: number;
        playwright: number;
        assertion: number;
        step: number;
    } {
        return ConfigManager.getAllTimeouts();
    }

    /**
     * Crea un logger con el nombre del componente especificado.
     * 
     * @param componente - Nombre del componente (ej: 'CucumberHooks', 'LoginPage')
     * @returns Logger de Pino
     * 
     * @example
     * ```typescript
     * const logger = AutomatizacionWeb.crearLogger('CucumberHooks');
     * logger.info('Mensaje de log');
     * ```
     */
    static crearLogger(componente: string): PinoLogger {
        return LoggerFactory.getLogger(componente);
    }

    // ===== CICLO DE VIDA =====

    async iniciar(): Promise<void> {
        const { browser, context, page } = await BrowserFactory.launch();
        this.navegador = browser;
        this.contexto = context;
        this.pagina = page;
        ReportingInterceptor.attachToPage(this.pagina);
        this.log.info('Automatizacion Web iniciada');
    }

    async limpiar(): Promise<void> {
        if (this.contexto) {
            await BrowserFactory.stop(this.contexto);
        }
        if (this.navegador) {
            await this.navegador.close();
        }
        this.log.info('Automatizacion Web finalizada');
    }

    // ===== MÉTODOS PARA HOOKS =====

    async iniciarEscenario(scenario: any): Promise<void> {
        ReportingInterceptor.startScenario(
            scenario.pickle.name,
            scenario.gherkinDocument.feature?.name
        );
        await this.iniciar();
    }

    async capturarStep(pickleStep: any, result: any, Status: any): Promise<void> {
        const config = ConfigManager.get();
        
        let stepStatus: 'passed' | 'failed' | 'skipped';

        if (result.status === Status.PASSED) {
            stepStatus = 'passed';
        } else if (result.status === Status.FAILED) {
            stepStatus = 'failed';
        } else if (result.status === Status.SKIPPED) {
            stepStatus = 'skipped';
        } else {
            stepStatus = 'skipped';
        }

        let screenshotPath: string | undefined;

        // ✅ CORRECTO: Solo captura en "always" o cuando falla en "on-failure"
        const debeCapturar = 
            config.screenshotMode === 'always' || 
            (config.screenshotMode === 'on-failure' && stepStatus === 'failed');

        if (debeCapturar) {
            try {
                const nombreArchivo = `step_${pickleStep.text
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 40)}`;

                screenshotPath = await ReportingInterceptor.captureScreenshot(
                    this.pagina,
                    nombreArchivo
                );
            } catch (error) {
                this.log.error({ error, step: pickleStep.text }, 'Error capturando screenshot del step');
            }
        }

        ReportingInterceptor.captureStep(pickleStep.text, stepStatus, screenshotPath);
    }

    async finalizarEscenario(scenario: any, Status: any): Promise<void> {
        const config = ConfigManager.get();
        
        // ✅ FIX: Lógica corregida para respetar screenshotMode
        const debeCapturarFinal = 
            config.screenshotMode === 'always' || 
            (config.screenshotMode === 'on-failure' && scenario.result?.status === Status.FAILED);

        if (debeCapturarFinal) {
            const nombreArchivo = `final_${scenario.pickle.name
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 50)}`;

            try {
                const screenshotPath = await ReportingInterceptor.captureScreenshot(
                    this.pagina,
                    nombreArchivo
                );
                
                (ReportingInterceptor as any).currentTest.screenshot = screenshotPath;
            } catch (error) {
                this.log.error({ error }, 'Error capturando screenshot final');
            }
        }

        const hasFailed = scenario.result?.status === Status.FAILED;

        ReportingInterceptor.endScenario(
            hasFailed ? 'failed' : 'passed',
            scenario.result?.message
        );

        await this.limpiar();
    }

    static async generarReporte(): Promise<void> {
        const { generateTestReport } = await import('../../cucumber/hooks/reportHelper');
        await generateTestReport();
    }

    // ===== ACCESO A OBJETOS PLAYWRIGHT =====

    obtenerPagina(): Page {
        return this.pagina;
    }

    obtenerContexto(): BrowserContext {
        return this.contexto;
    }

    obtenerNavegador(): Browser {
        return this.navegador;
    }

    obtenerConfiguracion() {
        return ConfigManager.get();
    }

    // ===== NAVEGACIÓN BASE =====

    async abrirPaginaBase(ruta: string = '/'): Promise<void> {
        await BrowserFactory.gotoBaseUrl(this.pagina, ruta);
    }

    // ===== UTILIDADES PARA REPORTING =====

    async capturarPantalla(nombre: string): Promise<void> {
        await ScreenshotHelper.capture(this.pagina, nombre);
    }
}