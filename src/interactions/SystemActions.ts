import { Page } from "@playwright/test";


export class SystemActions {
    static async setOffline(page: Page, offline = true) {
        await page.context().setOffline(offline);
    }
}