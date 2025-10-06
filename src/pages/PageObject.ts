// Framework5/src/pages/PageObject.ts
import type { AutomatizacionWeb } from '../cucumber/world/AutomatizacionWeb';
import { Page, Locator } from '@playwright/test';

export abstract class PageObject {
    protected page: Page;

    constructor(protected readonly world: AutomatizacionWeb) {
        this.page = world.obtenerPagina();
    }

    // ===== SELECTORES SIMPLIFICADOS =====

    protected $(selector: string): Locator {
        return this.page.locator(selector);
    }

    protected $$(selector: string): Promise<Locator[]> {
        return this.page.locator(selector).all();
    }

    // ===== ACCIONES BÁSICAS =====

    protected async escribir(selector: string, texto: string) {
        await this.$(selector).fill(texto);
    }

    protected async click(selector: string) {
        await this.$(selector).click();
    }

    protected async clickPorTexto(texto: string | RegExp) {
        await this.page.getByText(texto).click();
    }

    protected async clickPorRol(rol: any, nombre?: string | RegExp) {
        if (nombre) {
            await this.page.getByRole(rol, { name: nombre }).click();
        } else {
            await this.page.getByRole(rol).click();
        }
    }

    // ===== ESPERAS =====

    protected async esperar(selector: string, timeout = 10000) {
        await this.$(selector).waitFor({ state: 'visible', timeout });
    }

    protected async esperarOculto(selector: string, timeout = 10000) {
        await this.$(selector).waitFor({ state: 'hidden', timeout });
    }

    protected async esperarTexto(selector: string, texto: string | RegExp, timeout = 10000) {
        await this.esperar(selector, timeout);
        await this.page.waitForFunction(
            ({ sel, txt }) => {
                const element = document.querySelector(sel);
                if (!element) return false;
                const content = element.textContent || '';
                if (typeof txt === 'string') {
                    return content.includes(txt);
                }
                // Para RegExp, convertimos a string y creamos nueva RegExp en el navegador
                const pattern = new RegExp(txt.source, txt.flags);
                return pattern.test(content);
            },
            { sel: selector, txt: texto },
            { timeout }
        );
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
        return await this.$(selector).count() > 0;
    }

    protected async visible(selector: string): Promise<boolean> {
        return await this.$(selector).isVisible();
    }

    protected async habilitado(selector: string): Promise<boolean> {
        return await this.$(selector).isEnabled();
    }

    // ===== NAVEGACIÓN =====

    protected async navegar(ruta: string) {
        await this.world.abrirPaginaBase(ruta);
    }

    protected async navegarUrl(url: string) {
        await this.page.goto(url);
    }

    protected async recargar() {
        await this.page.reload();
    }

    protected async volver() {
        await this.page.goBack();
    }

    // ===== UTILIDADES =====

    protected async capturar(nombre: string) {
        await this.world.capturarPantalla(nombre);
    }

    protected async pausar(ms: number = 1000) {
        await this.page.waitForTimeout(ms);
    }

    protected async debug(mensaje?: string) {
        if (mensaje) console.log(`🔍 DEBUG [${this.constructor.name}]:`, mensaje);
        await this.page.pause();
    }

    // ===== FORMULARIOS =====

    protected async seleccionar(selector: string, valor: string) {
        await this.$(selector).selectOption(valor);
    }

    protected async marcar(selector: string) {
        await this.$(selector).check();
    }

    protected async desmarcar(selector: string) {
        await this.$(selector).uncheck();
    }

    protected async subirArchivo(selector: string, archivo: string) {
        await this.$(selector).setInputFiles(archivo);
    }

    // ===== TECLADO Y MOUSE =====

    protected async presionarTecla(tecla: string) {
        await this.page.keyboard.press(tecla);
    }

    protected async escribirTeclas(texto: string) {
        await this.page.keyboard.type(texto);
    }

    protected async hover(selector: string) {
        await this.$(selector).hover();
    }

    protected async dobleClick(selector: string) {
        await this.$(selector).dblclick();
    }

    protected async clickDerecho(selector: string) {
        await this.$(selector).click({ button: 'right' });
    }

    // ===== MÉTODOS AVANZADOS =====

    protected async esperarRespuesta(url: string | RegExp, timeout = 30000) {
        return await this.page.waitForResponse(url, { timeout });
    }

    protected async esperarNavegacion(url?: string | RegExp) {
        await this.page.waitForURL(url || '**/*');
    }

    protected async esperarAlguno(...selectores: string[]) {
        await this.page.waitForSelector(selectores.join(','), { state: 'visible' });
    }

    protected async ejecutar<T = any>(fn: (...args: any[]) => T, ...args: any[]): Promise<T> {
        return await this.page.evaluate(fn, ...args);
    }

    // ===== MÉTODOS DE SCROLL =====

    protected async scrollAbajo(pixels?: number) {
        if (pixels) {
            await this.page.evaluate((px) => window.scrollBy(0, px), pixels);
        } else {
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        }
    }

    protected async scrollArriba() {
        await this.page.evaluate(() => window.scrollTo(0, 0));
    }

    protected async scrollHacia(selector: string) {
        await this.$(selector).scrollIntoViewIfNeeded();
    }

    // ===== LOCATORS MODERNOS DE PLAYWRIGHT =====

    protected byRole(
        role: Parameters<Page['getByRole']>[0],
        options?: Parameters<Page['getByRole']>[1]
    ): Locator {
        return this.page.getByRole(role, options);
    }

    protected byText(
        text: string | RegExp,
        options?: Parameters<Page['getByText']>[1]
    ): Locator {
        return this.page.getByText(text, options);
    }

    protected byLabel(
        text: string | RegExp,
        options?: Parameters<Page['getByLabel']>[1]
    ): Locator {
        return this.page.getByLabel(text, options);
    }

    protected byPlaceholder(
        text: string | RegExp,
        options?: Parameters<Page['getByPlaceholder']>[1]
    ): Locator {
        return this.page.getByPlaceholder(text, options);
    }

    protected byTestId(testId: string): Locator {
        return this.page.getByTestId(testId);
    }

    protected byAltText(
        text: string | RegExp,
        options?: Parameters<Page['getByAltText']>[1]
    ): Locator {
        return this.page.getByAltText(text, options);
    }

    protected byTitle(
        text: string | RegExp,
        options?: Parameters<Page['getByTitle']>[1]
    ): Locator {
        return this.page.getByTitle(text, options);
    }

}