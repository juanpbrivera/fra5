import type { AutomatizacionWeb } from '../world/AutomatizacionWeb';
import { Page, Locator } from '@playwright/test';
import { ElementManager } from '../../elements/ElementManager';
import { WaitStrategies } from '../../elements/WaitStrategies';
import { InputActions } from '../../interactions/InputActions';
import { NavigationActions } from '../../interactions/NavigationActions';
import { ValidationStrategies } from '../../validations/ValidationStrategies';
import { UtilityHelper } from '../../utilities/UtilityHelper';
import { LoggerFactory } from '../../core/logging/LoggerFactory';
import { DataManager } from '../../utilities/DataManager';
import { esperar, AssercionesLocator, AssercionesPagina } from '../../validations/Assertions';

export abstract class PageObject {
    protected page: Page;
    private readonly elementMgr: ElementManager;
    private readonly logger = LoggerFactory.getLogger(this.constructor.name);

    constructor(protected readonly world: AutomatizacionWeb) {
        this.page = world.obtenerPagina();
        this.elementMgr = new ElementManager(this.page);
    }

    protected $(selector: string): Locator {
        return this.elementMgr.locator(selector);
    }

    protected async $$(selector: string): Promise<Locator[]> {
        return this.elementMgr.locatorAll(selector);
    }

    protected byTestId(id: string): Locator {
        return this.elementMgr.byTestId(id);
    }

    protected byRole(
        role: Parameters<Page['getByRole']>[0],
        options?: Parameters<Page['getByRole']>[1]
    ): Locator {
        return this.elementMgr.byRole(role, options);
    }

    protected byLabel(text: string | RegExp): Locator {
        return this.elementMgr.byLabel(text);
    }

    protected byPlaceholder(text: string | RegExp): Locator {
        return this.elementMgr.byPlaceholder(text);
    }

    protected byText(text: string | RegExp): Locator {
        return this.elementMgr.byText(text);
    }

    protected byAltText(text: string | RegExp): Locator {
        return this.elementMgr.byAltText(text);
    }

    protected byTitle(text: string | RegExp): Locator {
        return this.elementMgr.byTitle(text);
    }

    protected async escribir(selector: string, texto: string): Promise<void> {
        try {
            await InputActions.fill(this.page, selector, texto);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al escribir en "${selector}": ${error.message}`;
            this.logger.error({ selector, texto, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async click(selector: string): Promise<void> {
        try {
            await InputActions.click(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al hacer click en "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async clickPorTexto(texto: string | RegExp): Promise<void> {
        await this.byText(texto).click();
    }

    protected async clickPorRol(
        rol: Parameters<Page['getByRole']>[0],
        nombre?: string | RegExp
    ): Promise<void> {
        if (nombre) {
            await this.byRole(rol, { name: nombre }).click();
        } else {
            await this.byRole(rol).click();
        }
    }

    protected async doubleClick(selector: string): Promise<void> {
        try {
            await InputActions.doubleClick(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al hacer doble click en "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async clickDerecho(selector: string): Promise<void> {
        try {
            await InputActions.rightClick(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al hacer click derecho en "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async esperar(selector: string, timeout = 10000): Promise<void> {
        await WaitStrategies.waitForVisible(this.$(selector), timeout);
    }

    protected async esperarOculto(selector: string, timeout = 10000): Promise<void> {
        await WaitStrategies.waitForHidden(this.$(selector), timeout);
    }

    protected async esperarTexto(selector: string, texto: string | RegExp, timeout = 10000): Promise<void> {
        await WaitStrategies.toHaveText(this.$(selector), texto, timeout);
    }

    protected async esperarUrl(fragmento: string | RegExp, timeout = 10000): Promise<void> {
        await WaitStrategies.forUrlIncludes(this.page, fragmento, timeout);
    }

    protected async texto(selector: string): Promise<string | null> {
        return await this.$(selector).textContent();
    }

    protected async valor(selector: string): Promise<string> {
        return await this.$(selector).inputValue();
    }

    protected async atributo(selector: string, attr: string): Promise<string | null> {
        return await this.$(selector).getAttribute(attr);
    }

    protected async existe(selector: string): Promise<boolean> {
        return await ValidationStrategies.validateElementExists(this.page, selector);
    }

    protected async visible(selector: string): Promise<boolean> {
        return await ValidationStrategies.validateElementVisible(this.page, selector);
    }

    protected async habilitado(selector: string): Promise<boolean> {
        return await ValidationStrategies.validateElementEnabled(this.page, selector);
    }

    protected async navegar(ruta: string): Promise<void> {
        await this.world.abrirPaginaBase(ruta);
    }

    protected async navegarUrl(url: string): Promise<void> {
        await NavigationActions.goTo(this.page, url);
    }

    protected async recargar(): Promise<void> {
        await NavigationActions.reload(this.page);
    }

    protected async volver(): Promise<void> {
        await NavigationActions.back(this.page);
    }

    protected async adelante(): Promise<void> {
        await NavigationActions.forward(this.page);
    }

    protected async capturar(nombre: string): Promise<void> {
        await this.world.capturarPantalla(nombre);
    }

    protected async pausar(ms: number = 1000): Promise<void> {
        await UtilityHelper.waitForTimeout(this.page, ms);
    }

    protected async debug(mensaje?: string): Promise<void> {
        if (mensaje) this.logger.debug({ mensaje }, `DEBUG [${this.constructor.name}]`);
        await UtilityHelper.pause(this.page);
    }

    protected async setOffline(offline = true): Promise<void> {
        await UtilityHelper.setOffline(this.page, offline);
    }

    protected async seleccionar(selector: string, valor: string): Promise<void> {
        try {
            await InputActions.selectOption(this.page, selector, valor);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al seleccionar opción en "${selector}": ${error.message}`;
            this.logger.error({ selector, valor, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async marcar(selector: string): Promise<void> {
        try {
            await InputActions.check(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al marcar checkbox "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async desmarcar(selector: string): Promise<void> {
        try {
            await InputActions.uncheck(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al desmarcar checkbox "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async subirArchivo(selector: string, archivo: string): Promise<void> {
        try {
            await InputActions.uploadFile(this.page, selector, archivo);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al subir archivo en "${selector}": ${error.message}`;
            this.logger.error({ selector, archivo, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async presionarTecla(tecla: string): Promise<void> {
        await InputActions.press(this.page, tecla);
    }

    protected async escribirTeclas(texto: string, delay?: number): Promise<void> {
        await this.page.keyboard.type(texto, { delay });
    }

    protected async hover(selector: string): Promise<void> {
        try {
            await InputActions.hover(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al hacer hover en "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    protected async esperarRespuesta(url: string | RegExp, timeout = 30000) {
        return await WaitStrategies.forResponse(this.page, url, timeout);
    }

    protected async esperarNavegacion(url?: string | RegExp): Promise<void> {
        await WaitStrategies.forUrlEquals(this.page, url || '**/*');
    }

    protected async ejecutar<T = any>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
        return await UtilityHelper.evaluate(this.page, fn, ...args);
    }

    protected async scrollAbajo(pixels?: number): Promise<void> {
        if (pixels) {
            await InputActions.scrollBy(this.page, 0, pixels);
        } else {
            await InputActions.scrollToBottom(this.page);
        }
    }

    protected async scrollArriba(): Promise<void> {
        await InputActions.scrollToTop(this.page);
    }

    protected async scrollHacia(selector: string): Promise<void> {
        try {
            await InputActions.scrollIntoView(this.page, selector);
        } catch (error: any) {
            const metodo = this.obtenerMetodoLlamador();
            const mensaje = `Error en ${this.constructor.name}.${metodo}() al hacer scroll hacia "${selector}": ${error.message}`;
            this.logger.error({ selector, metodo }, mensaje);
            throw new Error(mensaje);
        }
    }

    private obtenerMetodoLlamador(): string {
        const stack = new Error().stack;
        if (!stack) return 'unknown';

        const lines = stack.split('\n');
        const methodPattern = /at \w+\.(\w+)/;

        for (const line of lines) {
            if (line.includes('at ' + this.constructor.name + '.') &&
                !line.includes('.escribir') &&
                !line.includes('.click') &&
                !line.includes('.obtenerMetodoLlamador')) {
                const match = methodPattern.exec(line);
                return match ? match[1] : 'unknown';
            }
        }
        return 'unknown';
    }

    // ===== LOCATORS EN ESPAÑOL (retornan Locator puro) =====

    /**
     * Obtiene elemento por rol ARIA.
     * @param rol - Rol del elemento ('button' | 'link' | 'textbox' | etc.)
     * @param opciones - Opciones adicionales como { name: 'texto' }
     */
    protected porRol(
        rol: Parameters<Page['getByRole']>[0],
        opciones?: Parameters<Page['getByRole']>[1]
    ): Locator {
        return this.elementMgr.byRole(rol, opciones);
    }

    /**
     * Obtiene elemento por texto visible.
     * @param texto - Texto a buscar (string o RegExp)
     */
    protected porTexto(texto: string | RegExp): Locator {
        return this.elementMgr.byText(texto);
    }

    /**
     * Obtiene elemento por etiqueta (label).
     * @param etiqueta - Texto de la etiqueta asociada
     */
    protected porEtiqueta(etiqueta: string | RegExp): Locator {
        return this.elementMgr.byLabel(etiqueta);
    }

    /**
     * Obtiene elemento por placeholder.
     * @param placeholder - Texto del placeholder
     */
    protected porPlaceholder(placeholder: string | RegExp): Locator {
        return this.elementMgr.byPlaceholder(placeholder);
    }

    /**
     * Obtiene elemento por atributo alt (imágenes).
     * @param textoAlt - Texto alternativo de la imagen
     */
    protected porTextoAlt(textoAlt: string | RegExp): Locator {
        return this.elementMgr.byAltText(textoAlt);
    }

    /**
     * Obtiene elemento por atributo title.
     * @param titulo - Texto del atributo title
     */
    protected porTitulo(titulo: string | RegExp): Locator {
        return this.elementMgr.byTitle(titulo);
    }

    /**
     * Obtiene elemento por data-testid.
     * @param id - Valor del atributo data-testid
     */
    protected porTestId(id: string): Locator {
        return this.elementMgr.byTestId(id);
    }

    // ===== ASSERTIONS EN ESPAÑOL =====

    /**
     * Crea assertions en español para validaciones de elementos o página.
     * 
     * @param objetivo - Locator o Page a verificar
     * @returns Objeto con métodos de assertion
     * 
     * @example
     * ```typescript
     * // Assert sobre un elemento
     * await this.verificar(this.porTexto('Login')).estaVisible();
     * await this.verificar(this.porRol('button')).estaHabilitado();
     * 
     * // Assert sobre la página
     * await this.verificar(this.page).tieneURL(/dashboard/);
     * ```
     */
    protected verificar(objetivo: Locator): AssercionesLocator;
    protected verificar(objetivo: Page): AssercionesPagina;
    protected verificar(objetivo: any): any {
        return esperar(objetivo);
    }

    /**
     * Obtiene data de prueba del JSON configurado.
     */
    protected obtenerDataJSON<T = any>(key: string): T | undefined {
        const config = this.world.obtenerConfiguracion();
        
        if (key.includes('.')) {
            return this.getNestedValue(config.dataPrueba, key) as T;
        }
        
        return config.dataPrueba?.[key] as T;
    }

    /**
     * ✅ Obtiene una fila de un CSV.
     * 
     * @param csvName - Nombre del CSV (sin extensión)
     * @param filters - Filtros para buscar la fila
     * @returns Objeto con la fila encontrada
     */
    protected async obtenerDataCSV<T = any>(
        csvName: string, 
        filters?: Record<string, any>
    ): Promise<T> {
        return await DataManager.obtenerFila<T>(csvName, filters);
    }

    /**
     * ✅ Obtiene todas las filas de un CSV.
     */
    protected async obtenerTodasLasFilasCSV<T = any>(
        csvName: string,
        filters?: Record<string, any>
    ): Promise<T[]> {
        return await DataManager.obtenerTodasLasFilas<T>(csvName, filters);
    }

    /**
     * ✅ Obtiene un valor específico de una fila CSV.
     */
    protected async obtenerValorCSV<T = any>(
        csvName: string,
        filters: Record<string, any>,
        column: string
    ): Promise<T> {
        return await DataManager.obtenerValor<T>(csvName, filters, column);
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}