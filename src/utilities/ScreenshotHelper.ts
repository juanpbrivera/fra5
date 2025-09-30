import { Page } from "@playwright/test";


export class ScreenshotHelper {
    static async capture(page: Page, name: string) {
        await page.screenshot({ path: `./artifacts/${name}-${Date.now()}.png`, fullPage: true });
    }
}