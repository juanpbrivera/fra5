import { Page, expect } from "@playwright/test";


export class NavigationActions {
    static async goTo(page: Page, url: string) { await page.goto(url); }
    static async back(page: Page) { await page.goBack(); }
    static async forward(page: Page) { await page.goForward(); }
    static async waitForURLChange(page: Page, expectedUrl: string | RegExp, opts?: { timeout?: number }) {
        await expect(page).toHaveURL(expectedUrl, { timeout: opts?.timeout ?? 10000 });
    }
}