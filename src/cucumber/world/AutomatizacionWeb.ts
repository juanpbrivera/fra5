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

    static cargarConfiguracion(ambiente?: string): void {
        ConfigManager.load(ambiente);
    }

    static obtenerTimeoutCucumber(): number {
        return ConfigManager.getCucumberTimeout();
    }

    static obtenerTimeoutPlaywright(): number {
        return ConfigManager.getPlaywrightTimeout();
    }

    static obtenerTimeoutAssertion(): number {
        return ConfigManager.getAssertionTimeout();
    }

    static obtenerTimeoutStep(): number {
        return ConfigManager.getStepTimeout();
    }

    static obtenerTodosLosTimeouts(): {
        cucumber: number;
        playwright: number;
        assertion: number;
        step: number;
    } {
        return ConfigManager.getAllTimeouts();
    }

    static crearLogger(componente: string): PinoLogger {
        return LoggerFactory.getLogger(componente);
    }

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

    async iniciarEscenario(scenario: any): Promise<void> {
        ReportingInterceptor.startScenario(
            scenario.pickle.name,
            scenario.gherkinDocument.feature?.name
        );
        await this.iniciar();
    }

    private esChromium(): boolean {
        const browser = process.env.BROWSER?.toLowerCase() || 'chromium';
        return browser === 'chromium' || browser === 'chrome';
    }

    /**
     * Espera a que la página esté completamente cargada antes de capturar screenshot.
     * Chrome: Solo delay simple sin tocar el estado de la página (evita reflow visual).
     * Firefox/Webkit: Esperas completas de carga.
     */
    private async esperarEstabilidadPagina(): Promise<void> {
        try {
            if (this.esChromium()) {
                // 🚀 CHROME: SOLO delay simple, SIN waitForLoadState
                // Esto evita que Playwright pause/modifique el rendering
                await this.pagina.waitForTimeout(800);
            } else {
                // 🦊 FIREFOX/WEBKIT: Esperas completas (no tienen problemas visuales)
                await this.pagina.waitForLoadState('load', { timeout: 5000 });
                await this.pagina.waitForLoadState('networkidle', { timeout: 3000 });
                await this.pagina.waitForTimeout(300);
            }
        } catch (error) {
            this.log.debug({ error }, 'Timeout esperando estabilidad, continuando...');
        }
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

        const debeCapturar = 
            config.screenshotMode === 'always' || 
            (config.screenshotMode === 'on-failure' && stepStatus === 'failed');

        let screenshotPath: string | undefined;

        if (debeCapturar) {
            try {
                await this.esperarEstabilidadPagina();

                const nombreArchivo = `step_${pickleStep.text
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 40)}`;

                screenshotPath = await ReportingInterceptor.captureScreenshot(
                    this.pagina,
                    nombreArchivo
                );
            } catch (error) {
                this.log.warn({ error, step: pickleStep.text }, 'Screenshot fallido');
            }
        }

        ReportingInterceptor.captureStep(pickleStep.text, stepStatus, screenshotPath);
    }

    async finalizarEscenario(scenario: any, Status: any): Promise<void> {
        const config = ConfigManager.get();
        
        const debeCapturarFinal = 
            config.screenshotMode === 'always' || 
            (config.screenshotMode === 'on-failure' && scenario.result?.status === Status.FAILED);

        if (debeCapturarFinal) {
            try {
                await this.esperarEstabilidadPagina();

                const nombreArchivo = `final_${scenario.pickle.name
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 50)}`;

                const screenshotPath = await ReportingInterceptor.captureScreenshot(
                    this.pagina,
                    nombreArchivo
                );
                
                (ReportingInterceptor as any).currentTest.screenshot = screenshotPath;
            } catch (error) {
                this.log.warn({ error }, 'Screenshot final fallido');
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

    async abrirPaginaBase(ruta: string = '/'): Promise<void> {
        await BrowserFactory.gotoBaseUrl(this.pagina, ruta);
    }

    async capturarPantalla(nombre: string): Promise<void> {
        await ScreenshotHelper.capture(this.pagina, nombre);
    }
}