import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class ReportingInterceptor {
  private static capturedTests: any[] = [];
  private static currentTest: any = {};

  static startScenario(scenarioName: string, featureName?: string): void {
    this.currentTest = {
      scenarioName,
      featureName: featureName || 'Default Feature',
      startTime: Date.now(),
      browser: process.env.BROWSER || 'chromium',
      steps: [],
      consoleLogs: [],
      pageErrors: [],
      networkFailures: []
    };
  }

  static captureStep(stepName: string, status: 'passed' | 'failed' | 'skipped'): void {
    if (!this.currentTest.steps) {
      this.currentTest.steps = [];
    }
    
    this.currentTest.steps.push({
      name: stepName,
      status,
      timestamp: new Date().toISOString()
    });
  }

  static async captureScreenshot(page: Page, name: string): Promise<string> {
    // Asegurar que el directorio existe
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    // Obtener el viewport actual
    const viewport = page.viewportSize();
    const width = viewport?.width || 1366;
    const height = viewport?.height || 768;
    
    // Configurar para máxima calidad
    // await page.setViewportSize({ width: 1920, height: 1080 });
    
    const filename = `${name}-${Date.now()}.png`;
    const screenshotPath = path.join('artifacts', filename);
    const fullPath = path.join(process.cwd(), screenshotPath);
    
    // Captura con máxima calidad PNG
    await page.screenshot({ 
      path: fullPath,
      fullPage: false,
      type: 'png',
      animations: 'disabled',
      scale: 'device',
      caret: 'hide'
    });
    
    // Restaurar viewport original
    await page.setViewportSize({ width, height });
    
    this.currentTest.screenshot = screenshotPath;
    return screenshotPath;
  }

  static attachToPage(page: Page): void {
    // Captura console logs
    page.on('console', msg => {
      if (!this.currentTest.consoleLogs) {
        this.currentTest.consoleLogs = [];
      }
      this.currentTest.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    // Captura errores de página
    page.on('pageerror', error => {
      if (!this.currentTest.pageErrors) {
        this.currentTest.pageErrors = [];
      }
      this.currentTest.pageErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Captura fallos de red
    page.on('requestfailed', request => {
      if (!this.currentTest.networkFailures) {
        this.currentTest.networkFailures = [];
      }
      this.currentTest.networkFailures.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
    });

    // Captura respuestas de red con errores
    page.on('response', response => {
      if (response.status() >= 400) {
        if (!this.currentTest.httpErrors) {
          this.currentTest.httpErrors = [];
        }
        this.currentTest.httpErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  static updateCurrentUrl(url: string): void {
    this.currentTest.url = url;
  }

  static endScenario(status: 'passed' | 'failed', errorMessage?: string): void {
    const endTime = Date.now();
    
    this.currentTest.status = status;
    this.currentTest.duration = endTime - (this.currentTest.startTime || endTime);
    this.currentTest.errorMessage = errorMessage;
    this.currentTest.endTime = endTime;
    
    this.capturedTests.push({ ...this.currentTest });
    
    // Reset manteniendo contexto si es necesario
    this.currentTest = {
      featureName: this.currentTest.featureName
    };
  }

  static getCapturedData(): any[] {
    return [...this.capturedTests];
  }

  static reset(): void {
    this.capturedTests = [];
    this.currentTest = {};
  }

  static captureError(error: any): void {
    if (!this.currentTest.errors) {
      this.currentTest.errors = [];
    }
    
    const errorInfo = {
      message: error?.message || String(error),
      stack: error?.stack,
      timestamp: new Date().toISOString()
    };
    
    this.currentTest.errors.push(errorInfo);
  }

  static getCurrentTestStats(): any {
    return {
      scenarioName: this.currentTest.scenarioName,
      duration: Date.now() - (this.currentTest.startTime || Date.now()),
      stepsExecuted: this.currentTest.steps?.length || 0,
      errors: this.currentTest.errors?.length || 0,
      consoleLogs: this.currentTest.consoleLogs?.length || 0
    };
  }

  static exportToJSON(filePath?: string): string {
    const data = {
      summary: {
        total: this.capturedTests.length,
        passed: this.capturedTests.filter(t => t.status === 'passed').length,
        failed: this.capturedTests.filter(t => t.status === 'failed').length,
        executedAt: new Date().toISOString()
      },
      tests: this.capturedTests
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    
    if (filePath) {
      fs.writeFileSync(filePath, jsonString, 'utf8');
    }
    
    return jsonString;
  }
}

export function attachReporting(page: Page, scenarioName: string): void {
  ReportingInterceptor.startScenario(scenarioName);
  ReportingInterceptor.attachToPage(page);
}

export async function captureOnFailure(page: Page, failed: boolean, name: string): Promise<void> {
  if (failed) {
    await ReportingInterceptor.captureScreenshot(page, name);
  }
}