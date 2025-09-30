// Integración con Cucumber (World para Web)
export { WebWorld } from './cucumber/world/WebWorld';

// Generación de Reporte Word (reutiliza docx-templates)
export { generateWordReport } from './helpers/WordReportHelper';

// “Interceptor”/reporting para Web (console/network/screenshot hooks)
export * from './core/browsers/interceptors/ReportingInterceptor';
