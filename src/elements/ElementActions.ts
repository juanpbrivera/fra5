import { Locator } from "@playwright/test";


export class ElementActions {
    static async click(locator: Locator) { await locator.click(); }
    static async type(locator: Locator, text: string, opts?: { delay?: number }) {
        await locator.fill("");
        await locator.type(text, { delay: opts?.delay });
    }
    static async select(locator: Locator, value: string) { await locator.selectOption(value); }
}