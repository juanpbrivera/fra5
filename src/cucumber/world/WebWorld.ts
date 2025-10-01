import { IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

import { ConfigManager } from '../../core/config/ConfigManager';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ElementManager } from '../../elements/ElementManager';
import { WaitStrategies } from '../../elements/WaitStrategies';
import { ScreenshotHelper } from '../../utilities/ScreenshotHelper';
import { generateWordReport, defaultWebReportTemplate } from '../../helpers/WordReportHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';

export interface WebWorldParameters {
  env?: string;      // 'cert' | 'desa' | 'prod'
  baseUrl?: string;  // opcional override
}

export class WebWorld {
  // Playwright
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Facade
  private em!: ElementManager;
  private log = LoggerFactory.getLogger('WebWorld');

  // Parámetros de Cucumber
  readonly parameters: WebWorldParameters;

  constructor(opts: IWorldOptions) {
    this.parameters = (opts.parameters as WebWorldParameters) || {};
    // Carga config (JSON-only), merge con DefaultConfig
    ConfigManager.load(this.parameters.env);
    if (this.parameters.baseUrl) {
      ConfigManager.override({ baseUrl: this.parameters.baseUrl });
    }
  }

  /** ===== Ciclo de vida ===== **/
  async init() {
    const { browser, context, page } = await BrowserFactory.launch();
    this.browser = browser;
    this.context = context;
    this.page = page;
    this.em = new ElementManager(page);
    this.log.info('World initialized');
  }

  async cleanup() {
    await BrowserFactory.stop(this.context);
    await this.browser.close();
    this.log.info('World cleaned up');
  }

  /** ===== Accesores “seguros” ===== **/
  cfg() { return ConfigManager.get(); }
  elements() { return this.em; } // Para PageObjects que quieran usar EM

  /** ===== Navegación / Interacciones ===== **/
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

  /** ===== Waits / Validaciones ===== **/
 async urlIncludes(fragment: string | RegExp, timeout = 10000) {
  await WaitStrategies.forUrlIncludes(this.page, fragment, timeout);
}

  async expectVisibleByTestId(testId: string, timeout = 10000) {
    await WaitStrategies.toBeVisible(this.em.byTestId(testId), timeout);
  }

  /** ===== Evidencias / Reporte ===== **/
  async screenshot(name: string) {
    await ScreenshotHelper.capture(this.page, name);
  }

  /**
   * Genera reporte Word usando el mismo enfoque que API.
   * @param data payload del reporte
   * @param outPath ruta de salida .docx
   * @param templatePath opcional; si no se pasa se usa el template por defecto
   */
  async generateWordReport(data: Parameters<typeof generateWordReport>[0], outPath: string, templatePath?: string) {
    const tpl = templatePath ?? defaultWebReportTemplate();
    return await generateWordReport(data, tpl, outPath);
  }
}

setWorldConstructor(WebWorld);
