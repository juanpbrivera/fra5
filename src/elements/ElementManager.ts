// Framework5/src/elements/ElementManager.ts
import { Page, Locator } from "@playwright/test";

/**
 * Helper para obtener locators usando selectores modernos de Playwright
 */
export class ElementManager {
    constructor(private readonly page: Page) {}

    // ===== LOCATORS MODERNOS PLAYWRIGHT =====
    
    byTestId(id: string): Locator {
        return this.page.getByTestId(id);
    }

    byRole(
        role: Parameters<Page['getByRole']>[0],
        options?: Parameters<Page['getByRole']>[1]
    ): Locator {
        return this.page.getByRole(role, options);
    }

    byLabel(text: string | RegExp, options?: Parameters<Page['getByLabel']>[1]): Locator {
        return this.page.getByLabel(text, options);
    }

    byPlaceholder(text: string | RegExp, options?: Parameters<Page['getByPlaceholder']>[1]): Locator {
        return this.page.getByPlaceholder(text, options);
    }

    byText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]): Locator {
        return this.page.getByText(text, options);
    }

    byAltText(text: string | RegExp, options?: Parameters<Page['getByAltText']>[1]): Locator {
        return this.page.getByAltText(text, options);
    }

    byTitle(text: string | RegExp, options?: Parameters<Page['getByTitle']>[1]): Locator {
        return this.page.getByTitle(text, options);
    }

    // ===== SELECTORES CSS/XPATH =====
    
    locator(selector: string): Locator {
        return this.page.locator(selector);
    }

    async locatorAll(selector: string): Promise<Locator[]> {
        return this.page.locator(selector).all();
    }
}