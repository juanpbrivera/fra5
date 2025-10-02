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
    
    return {
      testName: test.scenarioName || test.testName || 'Sin nombre',
      suiteName: test.featureName || 'Suite Principal',
      status: test.status === 'passed' ? 'passed' : 'failed',
      duration: test.duration || 0,
      errorMessage: test.errorMessage || test.validationErrors || null,
      screenshotPath: test.screenshot || null,
      screenshotImage: screenshotBase64
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
      executionDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    },
    testSuites: groupBySuite(tests)
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