// Framework5/src/validations/ValidationStrategies.ts
import { Page } from "@playwright/test";
import { WaitStrategies } from "../elements/WaitStrategies";

/**
 * Helper para validaciones comunes
 */
export class ValidationStrategies {
    static async validateLoggedIn(page: Page, selectorVisible: string): Promise<void> {
        await WaitStrategies.forUrlIncludes(page, "/home");
        await WaitStrategies.toBeVisible(page.locator(selectorVisible));
    }

    static async validateElementExists(page: Page, selector: string): Promise<boolean> {
        return await page.locator(selector).count() > 0;
    }

    static async validateElementVisible(page: Page, selector: string): Promise<boolean> {
        return await page.locator(selector).isVisible();
    }

    static async validateElementEnabled(page: Page, selector: string): Promise<boolean> {
        return await page.locator(selector).isEnabled();
    }

    static async validateElementDisabled(page: Page, selector: string): Promise<boolean> {
        return await page.locator(selector).isDisabled();
    }

    static async validateElementChecked(page: Page, selector: string): Promise<boolean> {
        return await page.locator(selector).isChecked();
    }
}