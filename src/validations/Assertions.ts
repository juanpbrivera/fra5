import { expect, Locator, Page } from "@playwright/test";
import { ConfigManager } from "../core/config/ConfigManager";
import { LoggerFactory } from "../core/logging/LoggerFactory";

const logger = LoggerFactory.getLogger('Assertions');

/**
 * Obtiene el timeout para assertions.
 * 
 * Prioridad:
 * 1. Parámetro explícito (si se proporciona)
 * 2. ConfigManager.getAssertionTimeout()
 */
function getTimeout(opciones?: { timeout?: number }): number {
    if (opciones?.timeout) {
        return opciones.timeout;
    }
    return ConfigManager.getAssertionTimeout();
}

export class AssercionesLocator {
    constructor(private readonly locator: Locator) {}

    async estaVisible(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeVisible({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            const mensaje = `❌ Elemento NO visible después de ${timeout}ms\n` +
                          `   Selector: ${selectorInfo}\n` +
                          `   Sugerencia: Verifica que el elemento exista en el DOM y sea visible.`;
            
            logger.error({ 
                selector: selectorInfo, 
                timeout,
                originalError: error.message 
            }, mensaje);
            
            throw new Error(mensaje);
        }
    }

    async estaOculto(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeHidden({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            const mensaje = `❌ Elemento NO está oculto después de ${timeout}ms\n` +
                          `   Selector: ${selectorInfo}`;
            
            logger.error({ selector: selectorInfo, timeout }, mensaje);
            throw new Error(mensaje);
        }
    }

    async tieneTexto(texto: string | RegExp, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toHaveText(texto, { timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            const textoActual = await this.locator.textContent().catch(() => 'No se pudo obtener');
            
            const mensaje = `❌ Texto NO coincide después de ${timeout}ms\n` +
                          `   Selector: ${selectorInfo}\n` +
                          `   Esperado: ${texto}\n` +
                          `   Actual: ${textoActual}`;
            
            logger.error({ 
                selector: selectorInfo, 
                esperado: texto, 
                actual: textoActual 
            }, mensaje);
            
            throw new Error(mensaje);
        }
    }

    async contieneTexto(texto: string | RegExp, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toContainText(texto, { timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            const textoActual = await this.locator.textContent().catch(() => 'No se pudo obtener');
            
            const mensaje = `❌ Texto NO contiene "${texto}" después de ${timeout}ms\n` +
                          `   Selector: ${selectorInfo}\n` +
                          `   Texto actual: ${textoActual}`;
            
            logger.error({ 
                selector: selectorInfo, 
                buscado: texto, 
                actual: textoActual 
            }, mensaje);
            
            throw new Error(mensaje);
        }
    }

    async estaHabilitado(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeEnabled({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            throw new Error(`❌ Elemento NO está habilitado: ${selectorInfo}`);
        }
    }

    async estaDeshabilitado(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeDisabled({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            throw new Error(`❌ Elemento NO está deshabilitado: ${selectorInfo}`);
        }
    }

    async estaMarcado(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeChecked({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            throw new Error(`❌ Elemento NO está marcado: ${selectorInfo}`);
        }
    }

    async tieneValor(valor: string | RegExp, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toHaveValue(valor, { timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            const valorActual = await this.locator.inputValue().catch(() => 'No se pudo obtener');
            
            throw new Error(
                `❌ Valor NO coincide: ${selectorInfo}\n` +
                `   Esperado: ${valor}\n` +
                `   Actual: ${valorActual}`
            );
        }
    }

    async tieneAtributo(atributo: string, valor: string | RegExp, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toHaveAttribute(atributo, valor, { timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            throw new Error(`❌ Atributo "${atributo}" NO coincide en: ${selectorInfo}`);
        }
    }

    async tieneCantidad(cantidad: number, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toHaveCount(cantidad, { timeout });
        } catch (error: any) {
            const count = await this.locator.count();
            throw new Error(
                `❌ Cantidad de elementos NO coincide\n` +
                `   Esperado: ${cantidad}\n` +
                `   Actual: ${count}`
            );
        }
    }

    async estaAdjunto(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeAttached({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            throw new Error(`❌ Elemento NO está adjunto al DOM: ${selectorInfo}`);
        }
    }

    async tieneFoco(opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.locator).toBeFocused({ timeout });
        } catch (error: any) {
            const selectorInfo = await this.obtenerInfoSelector();
            throw new Error(`❌ Elemento NO tiene foco: ${selectorInfo}`);
        }
    }

    private async obtenerInfoSelector(): Promise<string> {
        try {
            const locatorString = this.locator.toString();
            return locatorString;
        } catch {
            return 'Selector no disponible';
        }
    }
}

export class AssercionesPagina {
    constructor(private readonly page: Page) {}

    async tieneURL(patron: string | RegExp, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.page).toHaveURL(patron, { timeout });
        } catch (error: any) {
            const urlActual = this.page.url();
            throw new Error(
                `❌ URL NO coincide\n` +
                `   Esperado: ${patron}\n` +
                `   Actual: ${urlActual}`
            );
        }
    }

    async tieneTitulo(titulo: string | RegExp, opciones?: { timeout?: number }) {
        const timeout = getTimeout(opciones);
        try {
            await expect(this.page).toHaveTitle(titulo, { timeout });
        } catch (error: any) {
            const tituloActual = await this.page.title();
            throw new Error(
                `❌ Título NO coincide\n` +
                `   Esperado: ${titulo}\n` +
                `   Actual: ${tituloActual}`
            );
        }
    }
}

export function esperar(objetivo: Locator): AssercionesLocator;
export function esperar(objetivo: Page): AssercionesPagina;
export function esperar(objetivo: any): any {
    if ('goto' in objetivo) {
        return new AssercionesPagina(objetivo);
    }
    return new AssercionesLocator(objetivo);
}