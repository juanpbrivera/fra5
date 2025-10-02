// Framework5/src/cucumber/world/WebWorld.ts
import type { IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from '../../core/config/ConfigManager';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ElementManager } from '../../elements/ElementManager';
import { WaitStrategies } from '../../elements/WaitStrategies';
import { ScreenshotHelper } from '../../utilities/ScreenshotHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';
import { ReportingInterceptor } from '../../core/browsers/interceptors/ReportingInterceptor';

export interface WebWorldParameters {
  env?: string;
  baseUrl?: string;
  browser?: string;
}

export class WebWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  private em!: ElementManager;
  private log = LoggerFactory.getLogger('WebWorld');
  readonly parameters: WebWorldParameters;

  constructor(opts: IWorldOptions) {
    this.parameters = (opts.parameters as WebWorldParameters) || {};
    ConfigManager.load(this.parameters.env);
    
    const overrides: any = {};
    if (this.parameters.baseUrl) overrides.baseUrl = this.parameters.baseUrl;
    if (this.parameters.browser) overrides.browser = this.parameters.browser;
    
    if (Object.keys(overrides).length > 0) {
      ConfigManager.override(overrides);
    }
  }

  // Método TODO EN UNO para Before Hook
  async initScenario(scenarioName: string, featureName?: string): Promise<void> {
    this.log.info({ scenario: scenarioName }, 'Iniciando escenario');
    
    // Inicializar interceptor
    ReportingInterceptor.startScenario(scenarioName, featureName);
    
    // Inicializar browser
    const { browser, context, page } = await BrowserFactory.launch();
    this.browser = browser;
    this.context = context;
    this.page = page;
    this.em = new ElementManager(page);
    
    // Configurar viewport HD
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Adjuntar interceptors
    ReportingInterceptor.attachToPage(this.page);
    
    this.log.info('World initialized');
  }

  // Método TODO EN UNO para After Hook
  async cleanupScenario(scenario: any, Status: any): Promise<void> {
    try {
      // Capturar URL actual
      if (this.page) {
        const currentUrl = this.page.url();
        ReportingInterceptor.updateCurrentUrl(currentUrl);
      }
      
      // Screenshot si falla
      if (scenario.result?.status === Status.FAILED && this.page) {
        this.log.warn({ scenario: scenario.pickle.name }, 'Test fallido, capturando screenshot');
        await this.page.waitForTimeout(500);
        const screenshotName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
        await ReportingInterceptor.captureScreenshot(this.page, screenshotName);
      }
    } catch (error) {
      this.log.error({ error }, 'Error capturando screenshot');
    }
    
    // Capturar pasos
    scenario.pickle.steps.forEach((step: any, idx: number) => {
      const stepStatus = scenario.result?.status === Status.PASSED ? 'passed' : 
                        idx === 0 && scenario.result?.status === Status.FAILED ? 'failed' : 'skipped';
      ReportingInterceptor.captureStep(step.text, stepStatus);
    });
    
    // Finalizar escenario
    ReportingInterceptor.endScenario(
      scenario.result?.status === Status.PASSED ? 'passed' : 'failed',
      scenario.result?.message
    );
    
    this.log.info({ status: scenario.result?.status }, 'Escenario finalizado');
    
    // Cleanup
    await BrowserFactory.stop(this.context);
    await this.browser.close();
    this.log.info('World cleaned up');
  }

  // Métodos de navegación existentes
  async gotoBase(path: string = '/') {
    await BrowserFactory.gotoBaseUrl(this.page, path);
  }
  
  async typeByPlaceholder(placeholder: string, text: string, pressEnter = false) {
    await this.em.byPlaceholder(placeholder).fill(text);
    if (pressEnter) await this.page.keyboard.press('Enter');
  }
  
  async clickByText(text: string) {
    await this.em.byText(text).click();
  }

  async urlIncludes(fragment: string | RegExp, timeout = 10_000) {
    await WaitStrategies.forUrlIncludes(this.page, fragment, timeout);
  }
  
  async expectVisibleByTestId(testId: string, timeout = 10_000) {
    await WaitStrategies.toBeVisible(this.em.byTestId(testId), timeout);
  }

  async screenshot(name: string) {
    await ScreenshotHelper.capture(this.page, name);
  }
  
  cfg() { return ConfigManager.get(); }
  elements() { return this.em; }
}