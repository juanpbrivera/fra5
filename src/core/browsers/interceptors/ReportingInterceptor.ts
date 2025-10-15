import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerFactory } from '../../logging/LoggerFactory';
import type { Logger as PinoLogger } from 'pino';

interface TestStep {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  timestamp: string;
  screenshot?: string;
}

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: string;
}

interface PageError {
  message: string;
  stack?: string;
  timestamp: string;
}

interface NetworkFailure {
  url: string;
  method: string;
  failure?: string;
  timestamp: string;
}

interface HttpError {
  url: string;
  status: number;
  statusText: string;
  timestamp: string;
}

interface TestData {
  scenarioName: string;
  featureName: string;
  startTime: number;
  endTime?: number;
  browser: string;
  status?: 'passed' | 'failed';
  duration?: number;
  screenshot?: string;
  errorMessage?: string;
  steps: TestStep[];
  consoleLogs: ConsoleLog[];
  pageErrors: PageError[];
  networkFailures: NetworkFailure[];
  httpErrors: HttpError[];
}

export class ReportingInterceptor {
  private static capturedTests: TestData[] = [];
  private static currentTest: Partial<TestData> = {};
  private static readonly logger: PinoLogger = LoggerFactory.getLogger('ReportingInterceptor');
  private static readonly listenersAttached: WeakSet<Page> = new WeakSet();

  static startScenario(scenarioName: string, featureName: string = 'Default Feature'): void {
    this.currentTest = {
      scenarioName,
      featureName,
      startTime: Date.now(),
      browser: process.env.BROWSER || 'chromium',
      steps: [],
      consoleLogs: [],
      pageErrors: [],
      networkFailures: [],
      httpErrors: []
    };

    this.logger.info({ scenarioName, featureName }, 'Escenario iniciado');
  }

  static captureStep(stepName: string, status: 'passed' | 'failed' | 'skipped', screenshotPath?: string): void {
    this.currentTest.steps ??= [];

    this.currentTest.steps.push({
      name: stepName,
      status,
      timestamp: new Date().toISOString(),
      screenshot: screenshotPath
    });

    if (screenshotPath) {
      this.logger.debug({ stepName, screenshot: screenshotPath }, 'Step capturado con screenshot');
    }
  }

  /**
   * Detecta si el navegador actual es Chromium.
   */
  private static esChromium(): boolean {
    const browser = process.env.BROWSER?.toLowerCase() || 'chromium';
    return browser === 'chromium' || browser === 'chrome';
  }

  /**
   * Captura con CDP (Chrome DevTools Protocol) - solo para Chromium.
   * No modifica el rendering de la página.
   */
  private static async captureWithCDP(page: Page, fullPath: string): Promise<void> {
    const client = await page.context().newCDPSession(page);
    
    try {
      const screenshot = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
      });

      fs.writeFileSync(fullPath, Buffer.from(screenshot.data, 'base64'));
    } finally {
      await client.detach();
    }
  }

  /**
   * Captura con Playwright estándar - para Firefox/Webkit.
   */
  private static async captureWithPlaywright(page: Page, fullPath: string): Promise<void> {
    await page.screenshot({
      path: fullPath,
      fullPage: false,
      type: 'png',
      timeout: 5000,
    });
  }

  /**
   * Captura screenshot optimizado multi-navegador.
   * IMPORTANTE: Se debe llamar DESPUÉS de esperar la carga completa de la página.
   * 
   * @param page - Página de Playwright
   * @param name - Nombre del archivo
   * @returns Ruta relativa del screenshot
   */
  static async captureScreenshot(page: Page, name: string): Promise<string> {
    const artifactsDir = path.join(process.cwd(), 'artifacts');

    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const sanitizedName = name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const filename = `${sanitizedName}-${Date.now()}.png`;
    const screenshotPath = path.join('artifacts', filename);
    const fullPath = path.join(process.cwd(), screenshotPath);

    try {
      if (this.esChromium()) {
        // 🚀 CHROME: CDP directo (sin modificar rendering)
        await this.captureWithCDP(page, fullPath);
        this.logger.debug({ method: 'CDP', path: screenshotPath }, 'Screenshot capturado');
      } else {
        // 🦊 FIREFOX/WEBKIT: Playwright estándar
        await this.captureWithPlaywright(page, fullPath);
        this.logger.debug({ method: 'Playwright', path: screenshotPath }, 'Screenshot capturado');
      }

      return screenshotPath;
    } catch (error) {
      this.logger.warn({ error, name }, 'Error capturando screenshot');
      
      // Fallback: Intenta con método estándar
      try {
        await this.captureWithPlaywright(page, fullPath);
        return screenshotPath;
      } catch (fallbackError) {
        this.logger.error({ fallbackError, name }, 'Screenshot fallido completamente');
        return screenshotPath;
      }
    }
  }

  static attachToPage(page: Page): void {
    if (this.listenersAttached.has(page)) {
      this.logger.warn('Listeners ya adjuntos a esta página');
      return;
    }

    page.on('console', msg => {
      this.currentTest.consoleLogs?.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    page.on('pageerror', error => {
      this.currentTest.pageErrors?.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    page.on('requestfailed', request => {
      this.currentTest.networkFailures?.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        this.currentTest.httpErrors ??= [];

        this.currentTest.httpErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });

    this.listenersAttached.add(page);
  }

  static endScenario(status: 'passed' | 'failed', errorMessage?: string): void {
    const endTime = Date.now();
    const duration = endTime - (this.currentTest.startTime || endTime);

    this.currentTest.status = status;
    this.currentTest.duration = duration;
    this.currentTest.errorMessage = errorMessage;
    this.currentTest.endTime = endTime;

    this.capturedTests.push({ ...this.currentTest } as TestData);

    this.logger.info(
      {
        scenarioName: this.currentTest.scenarioName,
        status,
        duration,
        steps: this.currentTest.steps?.length || 0
      },
      'Escenario finalizado'
    );

    this.currentTest = {};
  }

  static getCapturedData(): TestData[] {
    return [...this.capturedTests];
  }

  static reset(): void {
    this.capturedTests = [];
    this.currentTest = {};
  }
}