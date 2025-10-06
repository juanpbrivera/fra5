// Framework5/src/pages/PageObject.ts
import type { AutomatizacionWeb } from '../cucumber/world/AutomatizacionWeb';
import { Page, Locator } from '@playwright/test';
import { ElementManager } from '../elements/ElementManager';
import { WaitStrategies } from '../elements/WaitStrategies';
import { InputActions } from '../interactions/InputActions';  // ← CAMBIO AQUÍ
import { NavigationActions } from '../interactions/NavigationActions';
import { ValidationStrategies } from '../validations/ValidationStrategies';
import { UtilityHelper } from '../utilities/UtilityHelper';

export abstract class PageObject {
    protected page: Page;
    private readonly elementMgr: ElementManager;
    
    constructor(protected readonly world: AutomatizacionWeb) {
        this.page = world.obtenerPagina();
        this.elementMgr = new ElementManager(this.page);
    }

    // ===== SELECTORES SIMPLIFICADOS =====
    
    protected $(selector: string): Locator {
        return this.elementMgr.locator(selector);
    }

    protected async $$(selector: string): Promise<Locator[]> {
        return this.elementMgr.locatorAll(selector);
    }

    // ===== LOCATORS MODERNOS =====
    
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

    // ===== ACCIONES BÁSICAS =====

    protected async escribir(selector: string, texto: string): Promise<void> {
        await InputActions.fill(this.page, selector, texto);  // ← CAMBIO AQUÍ
    }

    protected async click(selector: string): Promise<void> {
        await InputActions.click(this.page, selector);  // ← CAMBIO AQUÍ
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
        await InputActions.doubleClick(this.page, selector);  // ← CAMBIO AQUÍ
    }

    protected async clickDerecho(selector: string): Promise<void> {
        await InputActions.rightClick(this.page, selector);  // ← CAMBIO AQUÍ
    }

    // ===== ESPERAS =====

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

    // ===== OBTENER VALORES =====

    protected async texto(selector: string): Promise<string | null> {
        return await this.$(selector).textContent();
    }

    protected async valor(selector: string): Promise<string> {
        return await this.$(selector).inputValue();
    }

    protected async atributo(selector: string, attr: string): Promise<string | null> {
        return await this.$(selector).getAttribute(attr);
    }

    // ===== VALIDACIONES =====

    protected async existe(selector: string): Promise<boolean> {
        return await ValidationStrategies.validateElementExists(this.page, selector);
    }

    protected async visible(selector: string): Promise<boolean> {
        return await ValidationStrategies.validateElementVisible(this.page, selector);
    }

    protected async habilitado(selector: string): Promise<boolean> {
        return await ValidationStrategies.validateElementEnabled(this.page, selector);
    }

    // ===== NAVEGACIÓN =====

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

    // ===== UTILIDADES =====

    protected async capturar(nombre: string): Promise<void> {
        await this.world.capturarPantalla(nombre);
    }

    protected async pausar(ms: number = 1000): Promise<void> {
        await UtilityHelper.waitForTimeout(this.page, ms);
    }

    protected async debug(mensaje?: string): Promise<void> {
        if (mensaje) console.log(`🔍 DEBUG [${this.constructor.name}]:`, mensaje);
        await UtilityHelper.pause(this.page);
    }

    protected async setOffline(offline = true): Promise<void> {
        await UtilityHelper.setOffline(this.page, offline);
    }

    // ===== FORMULARIOS =====

    protected async seleccionar(selector: string, valor: string): Promise<void> {
        await InputActions.selectOption(this.page, selector, valor);  // ← CAMBIO AQUÍ
    }

    protected async marcar(selector: string): Promise<void> {
        await InputActions.check(this.page, selector);  // ← CAMBIO AQUÍ
    }

    protected async desmarcar(selector: string): Promise<void> {
        await InputActions.uncheck(this.page, selector);  // ← CAMBIO AQUÍ
    }

    protected async subirArchivo(selector: string, archivo: string): Promise<void> {
        await InputActions.uploadFile(this.page, selector, archivo);  // ← CAMBIO AQUÍ
    }

    // ===== TECLADO Y MOUSE =====

    protected async presionarTecla(tecla: string): Promise<void> {
        await InputActions.press(this.page, tecla);  // ← CAMBIO AQUÍ
    }

    protected async escribirTeclas(texto: string, delay?: number): Promise<void> {
        await this.page.keyboard.type(texto, { delay });
    }

    protected async hover(selector: string): Promise<void> {
        await InputActions.hover(this.page, selector);  // ← CAMBIO AQUÍ
    }

    // ===== MÉTODOS AVANZADOS =====

    protected async esperarRespuesta(url: string | RegExp, timeout = 30000) {
        return await WaitStrategies.forResponse(this.page, url, timeout);
    }

    protected async esperarNavegacion(url?: string | RegExp): Promise<void> {
        await WaitStrategies.forUrlEquals(this.page, url || '**/*');
    }

    protected async ejecutar<T = any>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
        return await UtilityHelper.evaluate(this.page, fn, ...args);
    }

    // ===== MÉTODOS DE SCROLL =====

    protected async scrollAbajo(pixels?: number): Promise<void> {
        if (pixels) {
            await InputActions.scrollBy(this.page, 0, pixels);  // ← CAMBIO AQUÍ
        } else {
            await InputActions.scrollToBottom(this.page);  // ← CAMBIO AQUÍ
        }
    }

    protected async scrollArriba(): Promise<void> {
        await InputActions.scrollToTop(this.page);  // ← CAMBIO AQUÍ
    }

    protected async scrollHacia(selector: string): Promise<void> {
        await InputActions.scrollIntoView(this.page, selector);  // ← CAMBIO AQUÍ
    }
}