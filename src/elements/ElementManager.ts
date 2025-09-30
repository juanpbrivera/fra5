import { Page, Locator } from "@playwright/test";
import * as L from "./Locators";


export class ElementManager {
    constructor(private page: Page) { }
    byTestId(id: string): Locator { return L.byTestId(this.page, id); }
    byRole(role: any, name?: string): Locator { return L.byRole(this.page, role, name); }
    byLabel(text: string): Locator { return L.byLabel(this.page, text); }
    byPlaceholder(text: string): Locator { return L.byPlaceholder(this.page, text); }
    byText(text: string): Locator { return L.byText(this.page, text); }
    css(selector: string): Locator { return L.css(this.page, selector); }
}