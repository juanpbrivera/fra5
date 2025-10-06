// Framework5/src/elements/WaitStrategies.ts
import { Locator, Page, expect } from '@playwright/test';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Helper para estrategias de espera y sincronización
 */
export class WaitStrategies {
    // ===== ESPERAS CON EXPECT =====
    
    static async toBeVisible(locator: Locator, timeout = 10_000): Promise<void> {
        await expect(locator).toBeVisible({ timeout });
    }

    static async toBeHidden(locator: Locator, timeout = 10_000): Promise<void> {
        await expect(locator).toBeHidden({ timeout });
    }

    static async toHaveText(locator: Locator, value: string | RegExp, timeout = 10_000): Promise<void> {
        await expect(locator).toHaveText(value, { timeout });
    }

    static async toBeEnabled(locator: Locator, timeout = 10_000): Promise<void> {
        await expect(locator).toBeEnabled({ timeout });
    }

    static async toBeDisabled(locator: Locator, timeout = 10_000): Promise<void> {
        await expect(locator).toBeDisabled({ timeout });
    }

    // ===== ESPERAS CON LOCATOR =====
    
    static async waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    static async waitForHidden(locator: Locator, timeout = 10_000): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }

    static async waitForAttached(locator: Locator, timeout = 10_000): Promise<void> {
        await locator.waitFor({ state: 'attached', timeout });
    }

    static async waitForDetached(locator: Locator, timeout = 10_000): Promise<void> {
        await locator.waitFor({ state: 'detached', timeout });
    }

    // ===== ESPERAS DE URL =====
    
    static async forUrlIncludes(page: Page, fragment: string | RegExp, timeout = 10_000): Promise<void> {
        const pattern = typeof fragment === 'string' ? new RegExp(escapeRegExp(fragment)) : fragment;
        await expect(page).toHaveURL(pattern, { timeout });
    }

    static async forUrlEquals(page: Page, url: string | RegExp, timeout = 10_000): Promise<void> {
        await page.waitForURL(url, { timeout });
    }

    // ===== ESPERAS DE TIEMPO =====
    
    static async forTimeout(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== ESPERAS DE RESPUESTA =====
    
    static async forResponse(page: Page, url: string | RegExp, timeout = 30_000) {
        return await page.waitForResponse(url, { timeout });
    }

    static async forRequest(page: Page, url: string | RegExp, timeout = 30_000) {
        return await page.waitForRequest(url, { timeout });
    }
}