import * as fs from 'fs';
import * as path from 'path';
import createReport from 'docx-templates';

export async function generateWordReport(
  webTests: any[], 
  outputPath: string
): Promise<void> {
  const tests = webTests.map((test) => ({
    testName: test.scenarioName || test.testName,
    suiteName: test.featureName || 'Default Suite',
    status: test.status,
    duration: test.duration || 0,
    errorMessage: test.errorMessage || test.validationErrors,
    webDetails: {
      URL: test.url,
      BROWSER: test.browser || 'chromium',
      VIEWPORT: test.viewport || 'default',
      SCREENSHOT: test.screenshot,
      STEPS: test.steps ? JSON.stringify(test.steps, null, 2) : 'N/A',
      PAGE_ERRORS: test.pageErrors ? JSON.stringify(test.pageErrors, null, 2) : 'None',
      CONSOLE_LOGS: test.consoleLogs ? JSON.stringify(test.consoleLogs, null, 2) : 'None',
      NETWORK_FAILURES: test.networkFailures ? JSON.stringify(test.networkFailures, null, 2) : 'None'
    }
  }));

  const reportData = {
    summary: {
      total: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
      duration: tests.reduce((sum, t) => sum + t.duration, 0),
      environment: process.env.ENV || 'cert',
      browser: process.env.BROWSER || 'chromium',
      executionDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    },
    testSuites: groupBySuite(tests),
    failedTests: tests.filter(t => t.status === 'failed')
  };

  // Busca la plantilla relativa a este archivo
  // Este archivo está en dist/helpers/WordReportHelper.js
  // La plantilla está en templates/plantilla-reporte.docx
  const templatePath = path.join(__dirname, '..', '..', 'templates', 'plantilla-reporte.docx');

  if (!fs.existsSync(templatePath)) {
    // Si no existe, intenta buscar en el directorio src
    const altTemplatePath = path.join(__dirname, '..', '..', '..', 'templates', 'plantilla-reporte.docx');
    if (fs.existsSync(altTemplatePath)) {
      const template = fs.readFileSync(altTemplatePath);
      const buffer = await createReport({
        template, 
        data: reportData,
        cmdDelimiter: ['{{', '}}']
      });

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, buffer);
      return;
    }
    
    throw new Error(`Template no encontrada. Buscada en: ${templatePath} y ${altTemplatePath}`);
  }

  const template = fs.readFileSync(templatePath);
  const buffer = await createReport({
    template, 
    data: reportData,
    cmdDelimiter: ['{{', '}}']
  });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, buffer);
}

function groupBySuite(tests: any[]) {
  const suiteMap = new Map();
  tests.forEach(test => {
    const suite = test.suiteName || 'Default';
    if (!suiteMap.has(suite)) {
      suiteMap.set(suite, []);
    }
    suiteMap.get(suite).push(test);
  });
  
  return Array.from(suiteMap.entries()).map(([suiteName, tests]) => ({
    suiteName, 
    tests
  }));
}