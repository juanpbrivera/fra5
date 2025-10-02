import { Before, After, AfterAll, Status } from '@cucumber/cucumber';
import { WebWorld } from '../world/WebWorld';
import * as fs from 'fs';
import * as path from 'path';

const testResults: any[] = [];
let testStartTime: Date;

export function attachReportingHooks() {
  Before(async function (this: WebWorld, scenario) {
    testStartTime = new Date();
    await this.init();
  });

  After(async function (this: WebWorld, scenario) {
    const testEndTime = new Date();
    
    // Screenshot si falla
    let screenshotPath;
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshotName = scenario.pickle.name.replace(/\s+/g, '_');
      await this.screenshot(screenshotName);
      screenshotPath = `./artifacts/${screenshotName}-${Date.now()}.png`;
    }
    
    // Guarda resultado
    testResults.push({
      scenario: scenario.pickle.name,
      status: scenario.result?.status === Status.PASSED ? 'PASSED' : 'FAILED',
      duration: testEndTime.getTime() - testStartTime.getTime(),
      errorMessage: scenario.result?.message,
      screenshot: screenshotPath,
      env: this.parameters.env || 'cert'
    });
    
    await this.cleanup();
  });

  AfterAll(async function () {
    if (testResults.length === 0 || process.env.SKIP_WORD_REPORT === 'true') return;
    
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const outputPath = path.join(reportsDir, `report-${Date.now()}.docx`);
    
    // Usa el helper del framework
    const { generateWordReport, defaultWebReportTemplate } = 
      require('../../helpers/WordReportHelper');
    
    try {
      await generateWordReport(
        {
          scenarios: testResults,
          totalScenarios: testResults.length,
          passed: testResults.filter(r => r.status === 'PASSED').length,
          failed: testResults.filter(r => r.status === 'FAILED').length
        },
        defaultWebReportTemplate(),
        outputPath
      );
      console.log(`\n📄 Reporte Word: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
    }
  });
}