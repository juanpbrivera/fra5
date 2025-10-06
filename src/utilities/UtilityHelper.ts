// Framework5/src/utilities/UtilityHelper.ts
import { Page } from "@playwright/test";

/**
 * Helper para utilidades del sistema y debugging
 */
export class UtilityHelper {
    // ===== NETWORK =====
    
    static async setOffline(page: Page, offline = true): Promise<void> {
        await page.context().setOffline(offline);
    }

    static async setOnline(page: Page): Promise<void> {
        await page.context().setOffline(false);
    }

    // ===== STORAGE =====
    
    static async clearCookies(page: Page): Promise<void> {
        await page.context().clearCookies();
    }

    static async clearLocalStorage(page: Page): Promise<void> {
        await page.evaluate(() => localStorage.clear());
    }

    static async clearSessionStorage(page: Page): Promise<void> {
        await page.evaluate(() => sessionStorage.clear());
    }

    // ===== VIEWPORT =====
    
    static async setViewport(page: Page, width: number, height: number): Promise<void> {
        await page.setViewportSize({ width, height });
    }

    static async getViewport(page: Page) {
        return page.viewportSize();
    }

    // ===== DEBUGGING =====
    
    static async pause(page: Page): Promise<void> {
        await page.pause();
    }

    static async waitForTimeout(page: Page, ms: number): Promise<void> {
        await page.waitForTimeout(ms);
    }

    // ===== JAVASCRIPT =====
    
    static async evaluate<R = any>(page: Page, fn: (...args: any[]) => R, ...args: any[]): Promise<R> {
        return await page.evaluate(fn, ...args);
    }

    static async evaluateHandle<R = any>(page: Page, fn: (...args: any[]) => R, ...args: any[]) {
        return await page.evaluateHandle(fn, ...args);
    }
}