import { Before, After, AfterAll, Status } from '@cucumber/cucumber';
import { WebWorld } from '../world/WebWorld';
import { ReportingInterceptor } from '../../core/browsers/interceptors/ReportingInterceptor';
import { generateWordReport } from '../../helpers/WordReportHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';

export class TestHooks {
  private static log = LoggerFactory.getLogger('TestHooks');

  static registerHooks(): void {
    Before(async function (this: WebWorld, scenario) {
      TestHooks.log.info({ scenario: scenario.pickle.name }, 'Iniciando escenario');
      
      ReportingInterceptor.startScenario(
        scenario.pickle.name,
        scenario.gherkinDocument.feature?.name
      );
      
      await this.init();
      
      if (this.page) {
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        ReportingInterceptor.attachToPage(this.page);
      }
    });

    After(async function (this: WebWorld, scenario) {
      try {
        // Capturar URL actual
        if (this.page) {
          const currentUrl = this.page.url();
          ReportingInterceptor.updateCurrentUrl(currentUrl);
        }
        
        // Captura screenshot si falla
        if (scenario.result?.status === Status.FAILED && this.page) {
          TestHooks.log.warn({ scenario: scenario.pickle.name }, 'Test fallido, capturando screenshot');
          
          await this.page.waitForTimeout(500);
          const screenshotName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
          await ReportingInterceptor.captureScreenshot(this.page, screenshotName);
        }
      } catch (error) {
        TestHooks.log.error({ error }, 'Error capturando screenshot');
      }
      
      // Captura los pasos
      scenario.pickle.steps.forEach((step, idx) => {
        const stepStatus = scenario.result?.status === Status.PASSED ? 'passed' : 
                          idx === 0 && scenario.result?.status === Status.FAILED ? 'failed' : 'skipped';
        ReportingInterceptor.captureStep(step.text, stepStatus);
      });
      
      // Finaliza el escenario
      ReportingInterceptor.endScenario(
        scenario.result?.status === Status.PASSED ? 'passed' : 'failed',
        scenario.result?.message
      );
      
      TestHooks.log.info(
        { 
          scenario: scenario.pickle.name, 
          status: scenario.result?.status 
        }, 
        'Escenario finalizado'
      );
      
      // Limpieza
      try {
        await this.cleanup();
      } catch (error) {
        TestHooks.log.error({ error }, 'Error en cleanup');
      }
    });

    AfterAll(async function () {
      const capturedData = ReportingInterceptor.getCapturedData();
      
      if (capturedData.length > 0 && process.env.SKIP_WORD_REPORT !== 'true') {
        const outputPath = `reports/test-report-${Date.now()}.docx`;
        
        try {
          await generateWordReport(capturedData, outputPath);
          TestHooks.log.info({ path: outputPath }, 'Reporte Word generado');
          console.log(`\n📄 Reporte Word generado: ${outputPath}`);
        } catch (error) {
          TestHooks.log.error({ error }, 'Error generando reporte');
        }
      }
      
      ReportingInterceptor.reset();
    });
  }
}