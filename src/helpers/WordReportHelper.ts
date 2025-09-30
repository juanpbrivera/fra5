import { readFileSync, writeFileSync } from 'fs';
import createReport from 'docx-templates';

export interface WordReportData {
  scenario: string;
  status: 'PASSED' | 'FAILED';
  steps: Array<{ name: string; status: string }>;
  screenshots?: string[]; // rutas a .png capturados
}

export async function generateWordReport(data: WordReportData, templatePath: string, outPath: string) {
  const template = readFileSync(templatePath);
  const buffer = await createReport({
    template,
    data
  });
  writeFileSync(outPath, buffer);
  return outPath;
}
