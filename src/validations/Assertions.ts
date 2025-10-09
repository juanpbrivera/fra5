// Framework5/src/validations/Assertions.ts
import { expect, Locator, Page } from "@playwright/test";
import { ConfigManager } from "../core/config/ConfigManager";

/**
 * Obtiene el timeout configurado o usa el por defecto de las opciones.
 */
function getTimeout(opciones?: { timeout?: number }): number {
    if (opciones?.timeout) {
        return opciones.timeout;
    }
    const config = ConfigManager.get();
    return config.timeout ?? 30000;
}

export class AssercionesLocator {
    constructor(private readonly locator: Locator) {}

    async estaVisible(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeVisible({ timeout: getTimeout(opciones) });
    }

    async estaOculto(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeHidden({ timeout: getTimeout(opciones) });
    }

    async tieneTexto(texto: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveText(texto, { timeout: getTimeout(opciones) });
    }

    async contieneTexto(texto: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toContainText(texto, { timeout: getTimeout(opciones) });
    }

    async estaHabilitado(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeEnabled({ timeout: getTimeout(opciones) });
    }

    async estaDeshabilitado(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeDisabled({ timeout: getTimeout(opciones) });
    }

    async estaMarcado(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeChecked({ timeout: getTimeout(opciones) });
    }

    async tieneValor(valor: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveValue(valor, { timeout: getTimeout(opciones) });
    }

    async tieneAtributo(atributo: string, valor: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveAttribute(atributo, valor, { timeout: getTimeout(opciones) });
    }

    async tieneCantidad(cantidad: number, opciones?: { timeout?: number }) {
        await expect(this.locator).toHaveCount(cantidad, { timeout: getTimeout(opciones) });
    }

    async estaAdjunto(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeAttached({ timeout: getTimeout(opciones) });
    }

    async tieneFoco(opciones?: { timeout?: number }) {
        await expect(this.locator).toBeFocused({ timeout: getTimeout(opciones) });
    }
}

export class AssercionesPagina {
    constructor(private readonly page: Page) {}

    async tieneURL(patron: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.page).toHaveURL(patron, { timeout: getTimeout(opciones) });
    }

    async tieneTitulo(titulo: string | RegExp, opciones?: { timeout?: number }) {
        await expect(this.page).toHaveTitle(titulo, { timeout: getTimeout(opciones) });
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