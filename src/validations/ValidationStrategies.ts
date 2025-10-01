import { Page } from "@playwright/test";
import { WaitStrategies } from "../elements/WaitStrategies";


export class ValidationStrategies {
    static async validateLoggedIn(page: Page, selectorVisible: string) {
        await WaitStrategies.forUrlIncludes(page, "/home");
        await WaitStrategies.toBeVisible(page.locator(selectorVisible));
    }
}