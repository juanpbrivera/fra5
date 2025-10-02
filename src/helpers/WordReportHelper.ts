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
    status: test.status === 'passed' ? 'PASSED' : 'FAILED',
    duration: test.duration || 0,
    errorMessage: test.errorMessage || test.validationErrors || null
  }));

  const reportData = {
    summary: {
      total: tests.length,
      passed: tests.filter(t => t.status === 'PASSED').length,
      failed: tests.filter(t => t.status === 'FAILED').length,
      duration: tests.reduce((sum, t) => sum + t.duration, 0),
      environment: process.env.ENV || 'cert',
      browser: process.env.BROWSER || 'chromium',
      executionDate: new Date().toLocaleString('es-PE')
    },
    testSuites: groupBySuite(tests)
  };

  const templatePath = path.join(__dirname, '..', '..', 'templates', 'plantilla-reporte-web.docx');
  
  if (!fs.existsSync(templatePath)) {
    const altTemplatePath = path.join(__dirname, '..', '..', '..', 'templates', 'plantilla-reporte-web.docx');
    if (fs.existsSync(altTemplatePath)) {
      const template = fs.readFileSync(altTemplatePath);
      const buffer = await createReport({
        template,
        data: reportData
        // NO especificar cmdDelimiter - dejar que use el default
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
    data: reportData
    // NO especificar cmdDelimiter - dejar que use el default
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