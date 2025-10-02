import * as fs from 'fs';
import * as path from 'path';
import createReport from 'docx-templates';

export async function generateWordReport(
  webTests: any[], 
  outputPath: string
): Promise<void> {
  const tests = webTests.map((test) => ({
    testName: test.scenarioName || test.testName || 'Sin nombre',
    suiteName: test.featureName || 'Suite Principal',
    status: test.status === 'passed' ? '✓ EXITOSO' : '✗ FALLIDO',
    duration: test.duration || 0,
    errorMessage: test.errorMessage || test.validationErrors || '',
    webDetails: {
      URL: test.url || 'N/A',
      BROWSER: test.browser || 'chromium',
      VIEWPORT: test.viewport || 'default',
      SCREENSHOT: test.screenshot || '',
      // Formatea los pasos de manera legible
      STEPS: test.steps && test.steps.length > 0 
        ? test.steps.map((s: any, i: number) => 
            `  ${i + 1}. ${s.name} - ${s.status}`
          ).join('\n')
        : '',
      // Formatea errores de página si existen
      PAGE_ERRORS: test.pageErrors && test.pageErrors.length > 0
        ? test.pageErrors.map((e: any) => `  • ${e.message}`).join('\n')
        : '',
      // Formatea logs de consola importantes
      CONSOLE_LOGS: test.consoleLogs && test.consoleLogs.filter((l: any) => l.type === 'error').length > 0
        ? test.consoleLogs
            .filter((l: any) => l.type === 'error')
            .map((l: any) => `  • ${l.text}`)
            .join('\n')
        : '',
      // Formatea fallos de red
      NETWORK_FAILURES: test.networkFailures && test.networkFailures.length > 0
        ? test.networkFailures.map((f: any) => `  • ${f.method} ${f.url}: ${f.failure}`).join('\n')
        : ''
    }
  }));

  const reportData = {
    summary: {
      total: tests.length,
      passed: tests.filter(t => t.status.includes('EXITOSO')).length,
      failed: tests.filter(t => t.status.includes('FALLIDO')).length,
      duration: tests.reduce((sum, t) => sum + t.duration, 0),
      environment: process.env.ENV || 'cert',
      browser: process.env.BROWSER || 'chromium',
      executionDate: new Date().toLocaleString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    testSuites: groupBySuite(tests),
    failedTests: tests.filter(t => t.status.includes('FALLIDO'))
  };

  // Busca la plantilla
  const templatePath = path.join(__dirname, '..', '..', 'templates', 'plantilla-reporte-web.docx');
  
  if (!fs.existsSync(templatePath)) {
    const altTemplatePath = path.join(__dirname, '..', '..', '..', 'templates', 'plantilla-reporte-web.docx');
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
    
    throw new Error(`Template no encontrada en: ${templatePath}`);
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
  const suiteMap = new Map<string, any[]>();
  
  tests.forEach(test => {
    const suite = test.suiteName || 'Suite Principal';
    if (!suiteMap.has(suite)) {
      suiteMap.set(suite, []);
    }
    suiteMap.get(suite)!.push(test);
  });
  
  return Array.from(suiteMap.entries()).map(([suiteName, tests]) => ({
    suiteName,
    tests
  }));
}