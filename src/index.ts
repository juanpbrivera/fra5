// Integración con Cucumber
export { WebWorld } from './cucumber/world/WebWorld';

// Hooks automáticos para tests
export { TestHooks } from './cucumber/hooks/TestHooks';

// Generación de Reporte Word
export { generateWordReport } from './helpers/WordReportHelper';

// Interceptor para reporting
export * from './core/browsers/interceptors/ReportingInterceptor';