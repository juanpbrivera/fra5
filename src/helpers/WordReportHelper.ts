import * as fs from 'fs';
import * as path from 'path';
import createReport from 'docx-templates';
import { LoggerFactory } from '../core/logging/LoggerFactory';

const log = LoggerFactory.getLogger('WordReportHelper');
const ANSI_ESCAPE_PATTERN = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

function stripAnsiCodes(text: string): string {
  if (!text) return text;
  return text.replace(ANSI_ESCAPE_PATTERN, '');
}

/**
 * Convierte imagen a base64 para inserción en Word.
 * 
 * @param imagePath - Ruta de la imagen
 * @returns Base64 string o null
 */
function imageToBase64(imagePath: string): string | null {
  if (!imagePath) return null;

  let fullPath = imagePath;
  if (!path.isAbsolute(imagePath)) {
    fullPath = path.join(process.cwd(), imagePath);
  }

  if (!fs.existsSync(fullPath)) {
    log.warn({ imagePath: fullPath }, 'Imagen no encontrada');
    return null;
  }

  try {
    const imageBuffer = fs.readFileSync(fullPath);
    return imageBuffer.toString('base64');
  } catch (error) {
    log.error({ error, imagePath }, 'Error leyendo imagen');
    return null;
  }
}

export async function generateWordReport(
  webTests: any[],
  outputPath: string
): Promise<void> {
  const tests = webTests.map((test) => {
    const cleanErrorMessage = test.errorMessage
      ? stripAnsiCodes(test.errorMessage)
      : null;

    // Procesar steps con screenshots
    const processedSteps = (test.steps || []).map((step: any) => {
      let icon = '';
      if (step.status === 'passed') icon = '✓';
      else if (step.status === 'failed') icon = '✗';
      else if (step.status === 'skipped') icon = '⊘';
      
      let screenshotBase64 = null;
      if (step.screenshot) {
        screenshotBase64 = imageToBase64(step.screenshot);
      }

      return {
        name: step.name,
        status: step.status,
        displayText: `  ${icon} ${step.name}`,
        screenshot: step.screenshot,
        screenshotImage: screenshotBase64
      };
    });

    // Screenshot final (solo si existe y es diferente a los de steps)
    let finalScreenshotBase64 = null;
    if (test.screenshot) {
      finalScreenshotBase64 = imageToBase64(test.screenshot);
    }

    return {
      testName: test.scenarioName || test.testName || 'Sin nombre',
      suiteName: test.featureName || 'Suite Principal',
      status: test.status === 'passed' ? 'passed' : 'failed',
      duration: test.duration || 0,
      errorMessage: cleanErrorMessage,
      screenshotPath: test.screenshot || null,
      screenshotImage: finalScreenshotBase64,
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
      screenshotMode: process.env.SCREENSHOT_MODE || 'on-failure',
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
          width: 12,
          height: 7.5,
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
  log.info({ outputPath, testsCount: tests.length }, 'Reporte Word generado exitosamente');
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