import { Page, Locator } from "@playwright/test";


export const byTestId = (page: Page, id: string): Locator => page.getByTestId(id);
export const byRole = (page: Page, role: any, name?: string): Locator =>
    name ? page.getByRole(role, { name }) : page.getByRole(role);
export const byLabel = (page: Page, text: string): Locator => page.getByLabel(text);
export const byPlaceholder = (page: Page, text: string): Locator => page.getByPlaceholder(text);
export const byText = (page: Page, text: string): Locator => page.getByText(text);
export const css = (page: Page, selector: string): Locator => page.locator(selector);