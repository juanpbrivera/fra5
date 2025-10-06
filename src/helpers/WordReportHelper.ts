import * as fs from 'fs';
import * as path from 'path';
import createReport from 'docx-templates';

function stripAnsiCodes(text: string): string {
  if (!text) return text;
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

export async function generateWordReport(
  webTests: any[],
  outputPath: string
): Promise<void> {
  const tests = webTests.map((test) => {
    let screenshotBase64 = null;
    if (test.screenshot) {
      let screenshotPath = test.screenshot;
      if (!path.isAbsolute(screenshotPath)) {
        screenshotPath = path.join(process.cwd(), test.screenshot);
      }

      if (fs.existsSync(screenshotPath)) {
        const imageBuffer = fs.readFileSync(screenshotPath);
        screenshotBase64 = imageBuffer.toString('base64');
        console.log(`✅ Screenshot encontrado y convertido: ${test.screenshot}, base64 length: ${screenshotBase64.length}`);
      } else {
        console.log(`❌ Screenshot no encontrado: ${screenshotPath}`);
      }
    }

    const cleanErrorMessage = test.errorMessage
      ? stripAnsiCodes(test.errorMessage)
      : null;

    // Procesar steps con ícono correcto
    const processedSteps = (test.steps || []).map((step: any) => {
      let icon = '';
      if (step.status === 'passed') icon = '✓';
      else if (step.status === 'failed') icon = '✗';
      else if (step.status === 'skipped') icon = '⊘';
      
      return {
        name: step.name,
        status: step.status,
        displayText: `  ${icon} ${step.name}`
      };
    });

    return {
      testName: test.scenarioName || test.testName || 'Sin nombre',
      suiteName: test.featureName || 'Suite Principal',
      status: test.status === 'passed' ? 'passed' : 'failed',
      duration: test.duration || 0,
      errorMessage: cleanErrorMessage,
      screenshotPath: test.screenshot || null,
      screenshotImage: screenshotBase64,
      steps: processedSteps
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
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      insertImage: (base64String: string) => {
        if (!base64String) return null;

        return {
          width: 16.15,
          height: 10,
          data: base64String,
          extension: '.png'
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