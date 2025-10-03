import { IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from '../../core/config/ConfigManager';
import { BrowserFactory } from '../../core/browsers/BrowserFactory';
import { ElementManager } from '../../elements/ElementManager';
import { WaitStrategies } from '../../elements/WaitStrategies';
import { ScreenshotHelper } from '../../utilities/ScreenshotHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';
// import { generateWordReport } from '../../helpers/WordReportHelper'; // Comentado hasta que se defina correctamente

export interface ParametrosAutomatizacion {
  ambiente?: string;      // 'cert' | 'desa' | 'prod'
  urlBase?: string;       // override opcional
}

// Definir el tipo WordReportData aquí si no está exportado
export interface WordReportData {
  scenario: string;
  status: 'PASSED' | 'FAILED';
  steps: Array<{ name: string; status: string; errorMessage?: string }>;
  screenshots?: string[];
  startedAt?: string;
  endedAt?: string;
  env?: string;
}

/**
 * Framework de Automatización Web con métodos en español
 * Diseñado para ser intuitivo para automatizadores de habla hispana
 */
export class AutomatizacionWeb {
  private navegador!: Browser;
  private contexto!: BrowserContext;
  private pagina!: Page;
  private gestor!: ElementManager;
  private log = LoggerFactory.getLogger('AutomatizacionWeb');
  readonly parametros: ParametrosAutomatizacion;

  constructor(opciones: IWorldOptions) {
    this.parametros = (opciones.parameters as ParametrosAutomatizacion) || {};
    ConfigManager.load(this.parametros.ambiente);
    if (this.parametros.urlBase) {
      ConfigManager.override({ baseUrl: this.parametros.urlBase });
    }
  }

  // ===== CICLO DE VIDA =====
  
  async iniciar() {
    const { browser, context, page } = await BrowserFactory.launch();
    this.navegador = browser;
    this.contexto = context;
    this.pagina = page;
    this.gestor = new ElementManager(page);
    this.log.info('Automatización Web iniciada');
  }

  async limpiar() {
    await BrowserFactory.stop(this.contexto);
    await this.navegador.close();
    this.log.info('Automatización Web finalizada');
  }

  // ===== NAVEGACIÓN =====

  async abrirUrl(url: string) {
    await this.pagina.goto(url);
  }

  async abrirPaginaBase(ruta: string = '/') {
    await BrowserFactory.gotoBaseUrl(this.pagina, ruta);
  }

  async refrescar() {
    await this.pagina.reload();
  }

  async irAtras() {
    await this.pagina.goBack();
  }

  async irAdelante() {
    await this.pagina.goForward();
  }

  // ===== INTERACCIONES CON ELEMENTOS =====

  async escribirPorId(testId: string, texto: string) {
    await this.gestor.byTestId(testId).fill(texto);
  }

  async escribirPorPlaceholder(placeholder: string, texto: string, presionarEnter = false) {
    await this.gestor.byPlaceholder(placeholder).fill(texto);
    if (presionarEnter) await this.pagina.keyboard.press('Enter');
  }

  async escribirPorEtiqueta(etiqueta: string, texto: string) {
    await this.gestor.byLabel(etiqueta).fill(texto);
  }

  async escribirEnCampo(selector: string, texto: string) {
    await this.gestor.css(selector).fill(texto);
  }

  async hacerClicPorTexto(texto: string) {
    await this.gestor.byText(texto).click();
  }

  async hacerClicPorId(testId: string) {
    await this.gestor.byTestId(testId).click();
  }

  async hacerClicPorRol(rol: any, nombre?: string) {
    await this.gestor.byRole(rol, nombre).click();
  }

  async hacerClicEnElemento(selector: string) {
    await this.gestor.css(selector).click();
  }

  async seleccionarOpcion(selector: string, valor: string) {
    await this.gestor.css(selector).selectOption(valor);
  }

  async subirArchivo(selector: string, rutaArchivo: string) {
    await this.gestor.css(selector).setInputFiles(rutaArchivo);
  }

  async marcarCheckbox(selector: string) {
    await this.gestor.css(selector).check();
  }

  async desmarcarCheckbox(selector: string) {
    await this.gestor.css(selector).uncheck();
  }

  // ===== VALIDACIONES =====

  async esperarUrlContenga(fragmento: string | RegExp, tiempoEspera = 10_000) {
    await WaitStrategies.forUrlIncludes(this.pagina, fragmento, tiempoEspera);
  }

  async esperarElementoVisible(selector: string, tiempoEspera = 10_000) {
    await WaitStrategies.toBeVisible(this.gestor.css(selector), tiempoEspera);
  }

  async esperarElementoVisiblePorId(testId: string, tiempoEspera = 10_000) {
    await WaitStrategies.toBeVisible(this.gestor.byTestId(testId), tiempoEspera);
  }

  async esperarTextoEnElemento(selector: string, texto: string | RegExp, tiempoEspera = 10_000) {
    await WaitStrategies.toHaveText(this.gestor.css(selector), texto, tiempoEspera);
  }

  async elementoExiste(selector: string): Promise<boolean> {
    return await this.gestor.css(selector).count() > 0;
  }

  async elementoEsVisible(selector: string): Promise<boolean> {
    return await this.gestor.css(selector).isVisible();
  }

  async elementoEstaHabilitado(selector: string): Promise<boolean> {
    return await this.gestor.css(selector).isEnabled();
  }

  async obtenerTexto(selector: string): Promise<string | null> {
    return await this.gestor.css(selector).textContent();
  }

  async obtenerValor(selector: string): Promise<string> {
    return await this.gestor.css(selector).inputValue();
  }

  async obtenerAtributo(selector: string, atributo: string): Promise<string | null> {
    return await this.gestor.css(selector).getAttribute(atributo);
  }

  async obtenerTituloPagina(): Promise<string> {
    return await this.pagina.title();
  }

  async obtenerUrlActual(): Promise<string> {
    return this.pagina.url();
  }

  // ===== ESPERAS =====

  async esperarTiempo(milisegundos: number) {
    await this.pagina.waitForTimeout(milisegundos);
  }

  async esperarSelector(selector: string, opciones?: { state?: 'attached' | 'detached' | 'visible' | 'hidden', timeout?: number }) {
    if (opciones) {
      await this.pagina.waitForSelector(selector, opciones);
    } else {
      await this.pagina.waitForSelector(selector);
    }
  }

  async esperarFuncion(funcion: () => boolean | Promise<boolean>, opciones?: { polling?: 'raf' | number, timeout?: number }) {
    await this.pagina.waitForFunction(funcion, opciones);
  }

  async esperarNavegacion(opciones?: { url?: string | RegExp, timeout?: number }) {
    await this.pagina.waitForURL(opciones?.url || '**/*', { timeout: opciones?.timeout });
  }

  async esperarRespuesta(url: string | RegExp, opciones?: { timeout?: number }) {
    await this.pagina.waitForResponse(url, opciones);
  }

  // ===== MANEJO DE VENTANAS Y ALERTAS =====

  async aceptarAlerta() {
    this.pagina.on('dialog', async dialog => {
      await dialog.accept();
    });
  }

  async cancelarAlerta() {
    this.pagina.on('dialog', async dialog => {
      await dialog.dismiss();
    });
  }

  async obtenerTextoAlerta(): Promise<string> {
    return new Promise(resolve => {
      this.pagina.once('dialog', async dialog => {
        resolve(dialog.message());
      });
    });
  }

  async cambiarVentana(indice: number) {
    const paginas = this.contexto.pages();
    if (indice < paginas.length) {
      this.pagina = paginas[indice];
    }
  }

  async cerrarVentanaActual() {
    await this.pagina.close();
    const paginas = this.contexto.pages();
    if (paginas.length > 0) {
      this.pagina = paginas[paginas.length - 1];
    }
  }

  // ===== EVIDENCIAS Y REPORTES =====

  async capturarPantalla(nombre: string) {
    await ScreenshotHelper.capture(this.pagina, nombre);
  }

  async capturarPantallaCompleta(nombre: string) {
    await this.pagina.screenshot({
      path: `reports/screenshots/${nombre}.png`,
      fullPage: true
    });
  }

  async generarReporteWord(datos: WordReportData, rutaSalida: string, rutaPlantilla?: string) {
    // Por ahora, guardar los datos como JSON si generateWordReport no funciona como esperado
    // TODO: Implementar correctamente cuando se defina WordReportHelper
    const fs = await import('fs');
    const path = await import('path');
    
    // Asegurar que el directorio existe
    const dir = path.dirname(rutaSalida);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Por ahora guardar como JSON
    const archivoJson = rutaSalida.replace('.docx', '.json');
    fs.writeFileSync(archivoJson, JSON.stringify(datos, null, 2));
    
    this.log.info(`Reporte guardado en: ${archivoJson}`);
    return archivoJson;
  }

  // ===== UTILIDADES =====

  async ejecutarScript<R = any>(script: string | ((...args: any[]) => R), ...args: any[]): Promise<R> {
    if (typeof script === 'string') {
      return await this.pagina.evaluate(script) as R;
    } else {
      return await this.pagina.evaluate(script, ...args);
    }
  }

  async limpiarCookies() {
    await this.contexto.clearCookies();
  }

  async limpiarAlmacenamientoLocal() {
    await this.pagina.evaluate(() => localStorage.clear());
  }

  async limpiarAlmacenamientoSesion() {
    await this.pagina.evaluate(() => sessionStorage.clear());
  }

  async establecerViewport(ancho: number, alto: number) {
    await this.pagina.setViewportSize({ width: ancho, height: alto });
  }

  async maximizarVentana() {
    await this.pagina.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);
    });
  }

  // ===== ACCESO DIRECTO A OBJETOS PLAYWRIGHT =====

  obtenerPagina(): Page {
    return this.pagina;
  }

  obtenerContexto(): BrowserContext {
    return this.contexto;
  }

  obtenerNavegador(): Browser {
    return this.navegador;
  }

  obtenerConfiguracion() {
    return ConfigManager.get();
  }
}