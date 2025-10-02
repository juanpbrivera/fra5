// Integración con Cucumber - World en español
export { AutomatizacionWeb } from './cucumber/world/AutomatizacionWeb';

// Helper para reportes
export { generateTestReport } from './cucumber/hooks/reportHelper';

// Generación de Reporte Word
export { generateWordReport } from './helpers/WordReportHelper';

// Interceptor para reporting
export * from './core/browsers/interceptors/ReportingInterceptor';