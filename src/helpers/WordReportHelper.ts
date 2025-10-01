import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import createReport from 'docx-templates';

export interface WordReportData {
  scenario: string;
  status: 'PASSED' | 'FAILED';
  steps: Array<{ name: string; status: string; errorMessage?: string }>;
  screenshots?: string[];
  startedAt?: string;
  endedAt?: string;
  env?: string;
}

export function defaultWebReportTemplate(): string {
  return path.resolve(__dirname, '../../templates/plantilla-reporte.docx');
}

export async function generateWordReport(
  data: WordReportData,
  templatePath: string,
  outPath: string
) {
  const template = readFileSync(templatePath);
  const buffer = await createReport({ template, data });
  writeFileSync(outPath, buffer);
  return outPath;
}
