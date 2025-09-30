import { Locator, Page, expect } from "@playwright/test";


export class WaitStrategies {
    static async toBeVisible(target: Locator | Page, timeout = 10000) {
        if ("locator" in target) {
            await expect(target as Locator).toBeVisible({ timeout });
        }
    }
    static async toHaveText(locator: Locator, value: string | RegExp, timeout = 10000) {
        await expect(locator).toHaveText(value, { timeout });
    }
    static async forUrlIncludes(page: Page, fragment: string, timeout = 10000) {
        await expect(page).toHaveURL(new RegExp(fragment), { timeout });
    }
}