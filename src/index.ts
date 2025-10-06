// Framework5/src/index.ts

// Integración con Cucumber - World en español
export { AutomatizacionWeb } from './cucumber/world/AutomatizacionWeb';

// Clase base para PageObjects =====
export { PageObject } from './pages/PageObject';

// Helper para reportes
export { generateTestReport } from './cucumber/hooks/reportHelper';

// Generación de Reporte Word
export { generateWordReport } from './helpers/WordReportHelper';

// Interceptor para reporting
export * from './core/browsers/interceptors/ReportingInterceptor';