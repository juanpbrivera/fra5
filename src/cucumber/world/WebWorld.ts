import { IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

import { ConfigManager } from '../../core/config/ConfigManager';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ElementManager } from '../../elements/ElementManager';
import { WaitStrategies } from '../../elements/WaitStrategies';
import { ScreenshotHelper } from '../../utilities/ScreenshotHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';

export interface WebWorldParameters {
  env?: string;      // 'cert' | 'desa' | 'prod'
  baseUrl?: string;  // override opcional
  browser?: string;  // 'chromium' | 'firefox' | 'webkit'
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

  /** ===== Accesores ===== **/
  cfg() { return ConfigManager.get(); }
  elements() { return this.em; }

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
  async urlIncludes(fragment: string | RegExp, timeout = 10_000) {
    await WaitStrategies.forUrlIncludes(this.page, fragment, timeout);
  }
  
  async expectVisibleByTestId(testId: string, timeout = 10_000) {
    await WaitStrategies.toBeVisible(this.em.byTestId(testId), timeout);
  }

  /** ===== Evidencias ===== **/
  async screenshot(name: string) {
    await ScreenshotHelper.capture(this.page, name);
  }
}