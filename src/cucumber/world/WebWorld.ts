import { IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ConfigManager } from '../../core/config/ConfigManager';

export interface WebWorldParameters {
  env?: string;        // ej: "cert"
  baseUrl?: string;    // opcional override
}

export class WebWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  parameters: WebWorldParameters;

  constructor(opts: IWorldOptions) {
    this.parameters = (opts.parameters as WebWorldParameters) || {};
    // Cargar config una sola vez (ENV desde parámetros o proceso)
    ConfigManager.load(this.parameters.env);
  }

  async init() {
    const { browser, context, page } = await BrowserFactory.launch();
    this.browser = browser;
    this.context = context;
    this.page = page;
  }

  async cleanup() {
    await BrowserFactory.stop(this.context);
    await this.browser.close();
  }
}

// registra el World para cucumber-js
setWorldConstructor(WebWorld);
