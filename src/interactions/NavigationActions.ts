// Framework5/src/interactions/NavigationActions.ts
import { Page, expect } from "@playwright/test";

/**
 * Helper para navegación y URLs
 */
export class NavigationActions {
    // ===== NAVEGACIÓN BÁSICA =====
    
    static async goTo(page: Page, url: string): Promise<void> {
        await page.goto(url);
    }

    static async back(page: Page): Promise<void> {
        await page.goBack();
    }

    static async forward(page: Page): Promise<void> {
        await page.goForward();
    }

    static async reload(page: Page): Promise<void> {
        await page.reload();
    }

    // ===== VALIDACIÓN DE URL =====
    
    static async waitForURLChange(page: Page, expectedUrl: string | RegExp, opts?: { timeout?: number }): Promise<void> {
        await expect(page).toHaveURL(expectedUrl, { timeout: opts?.timeout ?? 10000 });
    }

    static async waitForURLContains(page: Page, fragment: string, opts?: { timeout?: number }): Promise<void> {
        const pattern = new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        await expect(page).toHaveURL(pattern, { timeout: opts?.timeout ?? 10000 });
    }

    // ===== INFORMACIÓN =====
    
    static getCurrentUrl(page: Page): string {
        return page.url();
    }

    static async getTitle(page: Page): Promise<string> {
        return await page.title();
    }
}