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
    
    const screenshotPath = `artifacts/${name}-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
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
  }

  static endScenario(status: 'passed' | 'failed', errorMessage?: string): void {
    const endTime = Date.now();
    
    this.currentTest.status = status;
    this.currentTest.duration = endTime - (this.currentTest.startTime || endTime);
    this.currentTest.errorMessage = errorMessage;
    
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
}