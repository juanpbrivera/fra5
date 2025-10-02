import * as fs from 'fs';
import * as path from 'path';
import createReport from 'docx-templates';

export async function generateWordReport(
  webTests: any[], 
  outputPath: string
): Promise<void> {
  const tests = webTests.map((test) => {
    // Si hay screenshot, convertirlo a base64 para incluirlo en Word
    let screenshotBase64 = null;
    if (test.screenshot && fs.existsSync(test.screenshot)) {
      const imageBuffer = fs.readFileSync(test.screenshot);
      screenshotBase64 = imageBuffer.toString('base64');
    }
    
    // Formatear pasos ejecutados
    const formattedSteps = test.steps && test.steps.length > 0
      ? test.steps.map((step: any, index: number) => 
          `  ${index + 1}. ${step.name} - ${step.status.toUpperCase()}`
        ).join('\n')
      : null;
    
    // Formatear errores de página
    const formattedPageErrors = test.pageErrors && test.pageErrors.length > 0
      ? test.pageErrors.map((error: any) => 
          `  • ${error.message}`
        ).join('\n')
      : null;
    
    // Formatear errores de consola (solo errores, no logs)
    const formattedConsoleErrors = test.consoleLogs && test.consoleLogs.length > 0
      ? test.consoleLogs
          .filter((log: any) => log.type === 'error')
          .map((log: any) => `  • ${log.text}`)
          .join('\n')
      : null;
    
    // Formatear fallos de red
    const formattedNetworkFailures = test.networkFailures && test.networkFailures.length > 0
      ? test.networkFailures.map((failure: any) => 
          `  • ${failure.method} ${failure.url}: ${failure.failure}`
        ).join('\n')
      : null;
    
    return {
      testName: test.scenarioName || test.testName || 'Sin nombre',
      suiteName: test.featureName || 'Suite Principal',
      status: test.status === 'passed' ? 'passed' : 'failed',
      duration: test.duration || 0,
      errorMessage: test.errorMessage || test.validationErrors || null,
      screenshotPath: test.screenshot || null,
      screenshotImage: screenshotBase64,
      webDetails: {
        URL: test.url || 'No capturada',
        BROWSER: test.browser || 'chromium',
        VIEWPORT: '1920x1080',
        STEPS: formattedSteps,
        PAGE_ERRORS: formattedPageErrors,
        CONSOLE_ERRORS: formattedConsoleErrors,
        NETWORK_FAILURES: formattedNetworkFailures
      }
    };
  });

  const reportData = {
    summary: {
      total: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
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
    failedTests: tests.filter(t => t.status === 'failed')
  };

  const templatePath = path.join(__dirname, '..', '..', 'templates', 'plantilla-reporte-web.docx');
  
  let actualTemplatePath = templatePath;
  if (!fs.existsSync(templatePath)) {
    const altTemplatePath = path.join(__dirname, '..', '..', '..', 'templates', 'plantilla-reporte-web.docx');
    if (fs.existsSync(altTemplatePath)) {
      actualTemplatePath = altTemplatePath;
    } else {
      throw new Error(`Template no encontrada en: ${templatePath}`);
    }
  }

  const template = fs.readFileSync(actualTemplatePath);
  const buffer = await createReport({
    template,
    data: reportData,
    cmdDelimiter: ['{{', '}}'],
    additionalJsContext: {
      // Helper para insertar imágenes con máxima calidad y tamaño
      insertImage: (base64String: string) => {
        if (!base64String) return null;
        
        // Configuración para máxima calidad en Word
        return {
          width: 9,      // 9 pulgadas de ancho (casi toda la página)
          height: 5,     // 5 pulgadas de alto (proporción 16:9)
          data: base64String,
          extension: '.png',
          altText: 'Screenshot del test'
        };
      }
    }
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