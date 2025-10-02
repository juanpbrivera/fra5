// Framework5/src/cucumber/hooks/reportHelper.ts
import { generateWordReport } from '../../helpers/WordReportHelper';
import { ReportingInterceptor } from '../../core/browsers/interceptors/ReportingInterceptor';
import { LoggerFactory } from '../../core/logging/LoggerFactory';

const log = LoggerFactory.getLogger('ReportHelper');

export async function generateTestReport(): Promise<void> {
  const capturedData = ReportingInterceptor.getCapturedData();
  
  if (capturedData.length > 0 && process.env.SKIP_WORD_REPORT !== 'true') {
    const outputPath = `reports/test-report-${Date.now()}.docx`;
    
    try {
      await generateWordReport(capturedData, outputPath);
      log.info({ path: outputPath }, 'Reporte Word generado');
      console.log(`\n📄 Reporte Word generado: ${outputPath}`);
    } catch (error) {
      log.error({ error }, 'Error generando reporte');
    }
  }
  
  ReportingInterceptor.reset();
}