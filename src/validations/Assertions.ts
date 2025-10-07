// Framework5/src/validations/Assertions.ts
import { expect, Locator, Page } from "@playwright/test";

/**
 * Assertions para Locators (elementos).
 */
export class AssercionesLocator {
    constructor(private readonly locator: Locator) {}

    async estaVisible(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeVisible(opciones);
    }

    async estaOculto(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeHidden(opciones);
    }

    async tieneTexto(texto: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveText(texto, opciones);
    }

    async contieneTexto(texto: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toContainText(texto, opciones);
    }

    async estaHabilitado(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeEnabled(opciones);
    }

    async estaDeshabilitado(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeDisabled(opciones);
    }

    async estaMarcado(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeChecked(opciones);
    }

    async tieneValor(valor: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveValue(valor, opciones);
    }

    async tieneAtributo(atributo: string, valor: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveAttribute(atributo, valor, opciones);
    }

    async tieneCantidad(cantidad: number, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveCount(cantidad, opciones);
    }

    async estaAdjunto(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeAttached(opciones);
    }

    async tieneFoco(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeFocused(opciones);
    }
}

/**
 * Assertions para Page (página completa).
 */
export class AssercionesPagina {
    constructor(private readonly page: Page) {}

    async tieneURL(patron: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.page).toHaveURL(patron, opciones);
    }

    async tieneTitulo(titulo: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.page).toHaveTitle(titulo, opciones);
    }
}

/**
 * Función principal para crear assertions en español.
 */
export function esperar(objetivo: Locator): AssercionesLocator;
export function esperar(objetivo: Page): AssercionesPagina;
export function esperar(objetivo: any): any {
    if ('goto' in objetivo) {
        return new AssercionesPagina(objetivo);
    }
    return new AssercionesLocator(objetivo);
}