// Framework5/src/cucumber/world/AutomatizacionWeb.ts
import { IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from '../../core/config/ConfigManager';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ScreenshotHelper } from '../../utilities/ScreenshotHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';
import { ReportingInterceptor } from '../../core/browsers/interceptors/ReportingInterceptor';

export interface ParametrosAutomatizacion {
    ambiente?: string;
    urlBase?: string;
}

/**
 * World de Cucumber para automatización web
 * Maneja el ciclo de vida del navegador y provee acceso a objetos Playwright
 */
export class AutomatizacionWeb {
    private navegador!: Browser;
    private contexto!: BrowserContext;
    private pagina!: Page;
    private readonly log = LoggerFactory.getLogger('AutomatizacionWeb');  // ← readonly
    readonly parametros: ParametrosAutomatizacion;

    constructor(opciones: IWorldOptions) {
        this.parametros = (opciones.parameters as ParametrosAutomatizacion) || {};
        ConfigManager.load(this.parametros.ambiente);
        if (this.parametros.urlBase) {
            ConfigManager.override({ baseUrl: this.parametros.urlBase });
        }
    }

    // ===== CICLO DE VIDA =====

    async iniciar(): Promise<void> {
        const { browser, context, page } = await BrowserFactory.launch();
        this.navegador = browser;
        this.contexto = context;
        this.pagina = page;
        ReportingInterceptor.attachToPage(this.pagina);
        this.log.info('Automatización Web iniciada');
    }

    async limpiar(): Promise<void> {
        if (this.contexto) {
            await BrowserFactory.stop(this.contexto);
        }
        if (this.navegador) {
            await this.navegador.close();
        }
        this.log.info('Automatización Web finalizada');
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

        ReportingInterceptor.captureStep(pickleStep.text, stepStatus);
    }

    async finalizarEscenario(scenario: any, Status: any): Promise<void> {
        if (scenario.result?.status === Status.FAILED) {
            const nombreArchivo = scenario.pickle.name
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 50);

            try {
                await ReportingInterceptor.captureScreenshot(this.pagina, nombreArchivo);
            } catch (error) {
                this.log.error({ error }, 'Error capturando screenshot');
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