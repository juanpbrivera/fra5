// Framework5/src/interactions/InputActions.ts
import { Page, Locator } from "@playwright/test";

/**
 * Helper para interacciones de input (clicks, teclado, formularios)
 */
export class InputActions {
    // ===== CLICKS =====
    
    static async click(page: Page, selector: string): Promise<void> {
        await page.locator(selector).click();
    }

    static async clickLocator(locator: Locator): Promise<void> {
        await locator.click();
    }

    static async doubleClick(page: Page, selector: string): Promise<void> {
        await page.locator(selector).dblclick();
    }

    static async rightClick(page: Page, selector: string): Promise<void> {
        await page.locator(selector).click({ button: 'right' });
    }

    static async clickAt(page: Page, selector: string, x: number, y: number): Promise<void> {
        await page.locator(selector).click({ position: { x, y } });
    }

    // ===== INPUT / TECLADO =====
    
    static async fill(page: Page, selector: string, text: string): Promise<void> {
        await page.locator(selector).fill(text);
    }

    static async fillLocator(locator: Locator, text: string): Promise<void> {
        await locator.fill(text);
    }

    static async type(page: Page, selector: string, text: string, options?: { delay?: number }): Promise<void> {
        await page.locator(selector).fill("");
        await page.locator(selector).pressSequentially(text, { delay: options?.delay });
    }

    static async clear(page: Page, selector: string): Promise<void> {
        await page.locator(selector).clear();
    }

    static async press(page: Page, key: string): Promise<void> {
        await page.keyboard.press(key);
    }

    static async pressSequentially(page: Page, selector: string, text: string, delay?: number): Promise<void> {
        await page.locator(selector).pressSequentially(text, { delay });
    }

    // ===== HOVER / FOCUS =====
    
    static async hover(page: Page, selector: string): Promise<void> {
        await page.locator(selector).hover();
    }

    static async focus(page: Page, selector: string): Promise<void> {
        await page.locator(selector).focus();
    }

    static async blur(page: Page, selector: string): Promise<void> {
        await page.locator(selector).blur();
    }

    // ===== DRAG & DROP =====
    
    static async dragTo(page: Page, sourceSelector: string, targetSelector: string): Promise<void> {
        await page.locator(sourceSelector).dragTo(page.locator(targetSelector));
    }

    // ===== FORMULARIOS =====
    
    static async selectOption(page: Page, selector: string, value: string | string[]): Promise<void> {
        await page.locator(selector).selectOption(value);
    }

    static async check(page: Page, selector: string): Promise<void> {
        await page.locator(selector).check();
    }

    static async uncheck(page: Page, selector: string): Promise<void> {
        await page.locator(selector).uncheck();
    }

    static async uploadFile(page: Page, selector: string, filePath: string | string[]): Promise<void> {
        await page.locator(selector).setInputFiles(filePath);
    }

    // ===== SCROLL =====
    
    static async scrollIntoView(page: Page, selector: string): Promise<void> {
        await page.locator(selector).scrollIntoViewIfNeeded();
    }

    static async scrollToTop(page: Page): Promise<void> {
        await page.evaluate(() => window.scrollTo(0, 0));
    }

    static async scrollToBottom(page: Page): Promise<void> {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }

    static async scrollBy(page: Page, x: number, y: number): Promise<void> {
        await page.evaluate(({ dx, dy }) => window.scrollBy(dx, dy), { dx: x, dy: y });
    }
}