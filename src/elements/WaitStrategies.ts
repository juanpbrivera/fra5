import { Locator, Page, expect } from '@playwright/test';

// Escapa caracteres especiales cuando nos pasan un string para usarlo como RegExp
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class WaitStrategies {
  /**
   * Espera a que un Locator sea visible.
   */
  static async toBeVisible(locator: Locator, timeout = 10_000) {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Espera a que un Locator tenga el texto indicado (string o RegExp).
   */
  static async toHaveText(locator: Locator, value: string | RegExp, timeout = 10_000) {
    await expect(locator).toHaveText(value, { timeout });
  }

  /**
   * Espera a que la URL de la página contenga el fragmento indicado.
   * Acepta string o RegExp. Si es string, se convierte a RegExp seguro.
   */
  static async forUrlIncludes(page: Page, fragment: string | RegExp, timeout = 10_000) {
    const pattern = typeof fragment === 'string'
      ? new RegExp(escapeRegExp(fragment))
      : fragment;

    await expect(page).toHaveURL(pattern, { timeout });
  }
}
