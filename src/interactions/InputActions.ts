import { Page, Locator, expect } from "@playwright/test";
import { LoggerFactory } from '../core/logging/LoggerFactory';

const logger = LoggerFactory.getLogger('InputActions');

export class InputActions {
    
    static async click(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.click();
        } catch (error: any) {
            const message = `No se pudo hacer click en el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async clickLocator(locator: Locator): Promise<void> {
        try {
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.click();
        } catch (error: any) {
            const message = `No se pudo hacer click en el locator. ${error.message}`;
            logger.error({ error: error.message }, message);
            throw new Error(message);
        }
    }

    static async doubleClick(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.dblclick();
        } catch (error: any) {
            const message = `No se pudo hacer doble click en el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async rightClick(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.click({ button: 'right' });
        } catch (error: any) {
            const message = `No se pudo hacer click derecho en el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async clickAt(page: Page, selector: string, x: number, y: number): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.click({ position: { x, y } });
        } catch (error: any) {
            const message = `No se pudo hacer click en posición (${x}, ${y}) del selector: "${selector}". ${error.message}`;
            logger.error({ selector, x, y, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async fill(page: Page, selector: string, text: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.fill(text);
        } catch (error: any) {
            const message = `No se pudo llenar el campo con selector: "${selector}". ${error.message}`;
            logger.error({ selector, text, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async fillLocator(locator: Locator, text: string): Promise<void> {
        try {
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.fill(text);
        } catch (error: any) {
            const message = `No se pudo llenar el campo con el locator. ${error.message}`;
            logger.error({ text, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async type(page: Page, selector: string, text: string, options?: { delay?: number }): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.fill("");
            await locator.pressSequentially(text, { delay: options?.delay });
        } catch (error: any) {
            const message = `No se pudo escribir en el selector: "${selector}". ${error.message}`;
            logger.error({ selector, text, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async clear(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.clear();
        } catch (error: any) {
            const message = `No se pudo limpiar el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async press(page: Page, key: string): Promise<void> {
        await page.keyboard.press(key);
    }

    static async pressSequentially(page: Page, selector: string, text: string, delay?: number): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.pressSequentially(text, { delay });
        } catch (error: any) {
            const message = `No se pudo escribir secuencialmente en el selector: "${selector}". ${error.message}`;
            logger.error({ selector, text, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async hover(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.hover();
        } catch (error: any) {
            const message = `No se pudo hacer hover sobre el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async focus(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.focus();
        } catch (error: any) {
            const message = `No se pudo enfocar el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async blur(page: Page, selector: string): Promise<void> {
        try {
            await page.locator(selector).blur();
        } catch (error: any) {
            const message = `No se pudo desenfocar el selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async dragTo(page: Page, sourceSelector: string, targetSelector: string): Promise<void> {
        try {
            const source = page.locator(sourceSelector);
            const target = page.locator(targetSelector);
            await expect(source).toBeVisible({ timeout: 10000 });
            await expect(target).toBeVisible({ timeout: 10000 });
            await source.dragTo(target);
        } catch (error: any) {
            const message = `No se pudo arrastrar desde "${sourceSelector}" hasta "${targetSelector}". ${error.message}`;
            logger.error({ sourceSelector, targetSelector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async selectOption(page: Page, selector: string, value: string | string[]): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.selectOption(value);
        } catch (error: any) {
            const message = `No se pudo seleccionar opción en el selector: "${selector}". ${error.message}`;
            logger.error({ selector, value, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async check(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.check();
        } catch (error: any) {
            const message = `No se pudo marcar el checkbox con selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async uncheck(page: Page, selector: string): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeVisible({ timeout: 10000 });
            await locator.uncheck();
        } catch (error: any) {
            const message = `No se pudo desmarcar el checkbox con selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async uploadFile(page: Page, selector: string, filePath: string | string[]): Promise<void> {
        try {
            const locator = page.locator(selector);
            await expect(locator).toBeAttached({ timeout: 10000 });
            await locator.setInputFiles(filePath);
        } catch (error: any) {
            const message = `No se pudo subir archivo al selector: "${selector}". ${error.message}`;
            logger.error({ selector, filePath, error: error.message }, message);
            throw new Error(message);
        }
    }

    static async scrollIntoView(page: Page, selector: string): Promise<void> {
        try {
            await page.locator(selector).scrollIntoViewIfNeeded();
        } catch (error: any) {
            const message = `No se pudo hacer scroll al selector: "${selector}". ${error.message}`;
            logger.error({ selector, error: error.message }, message);
            throw new Error(message);
        }
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