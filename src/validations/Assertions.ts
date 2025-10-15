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

    async estaVisible(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeVisible({ timeout });
    }

    async estaOculto(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeHidden({ timeout });
    }

    async tieneTexto(texto: string | RegExp, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toHaveText(texto, { timeout });
    }

    async contieneTexto(texto: string | RegExp, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toContainText(texto, { timeout });
    }

    async estaHabilitado(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeEnabled({ timeout });
    }

    async estaDeshabilitado(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeDisabled({ timeout });
    }

    async estaMarcado(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeChecked({ timeout });
    }

    async tieneValor(valor: string | RegExp, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toHaveValue(valor, { timeout });
    }

    async tieneAtributo(atributo: string, valor: string | RegExp, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toHaveAttribute(atributo, valor, { timeout });
    }

    async tieneCantidad(cantidad: number, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toHaveCount(cantidad, { timeout });
    }

    async estaAdjunto(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeAttached({ timeout });
    }

    async tieneFoco(opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.locator).toBeFocused({ timeout });
    }
}

export class AssercionesPagina {
    constructor(private readonly page: Page) {}

    async tieneURL(patron: string | RegExp, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.page).toHaveURL(patron, { timeout });
    }

    async tieneTitulo(titulo: string | RegExp, opciones?: { timeout?: number }): Promise<void> {
        const timeout = getTimeout(opciones);
        await expect(this.page).toHaveTitle(titulo, { timeout });
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