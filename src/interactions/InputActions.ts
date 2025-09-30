import { Page } from "@playwright/test";


export class InputActions {
    static async type(page: Page, selector: string, text: string) {
        await page.fill(selector, text);
    }
    static async press(page: Page, key: string) {
        await page.keyboard.press(key);
    }
}