import { Locator, Page, expect } from '@playwright/test';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class WaitStrategies {
  static async toBeVisible(locator: Locator, timeout = 10_000) {
    await expect(locator).toBeVisible({ timeout });
  }
  static async toHaveText(locator: Locator, value: string | RegExp, timeout = 10_000) {
    await expect(locator).toHaveText(value, { timeout });
  }
  static async forUrlIncludes(page: Page, fragment: string | RegExp, timeout = 10_000) {
    const pattern = typeof fragment === 'string' ? new RegExp(escapeRegExp(fragment)) : fragment;
    await expect(page).toHaveURL(pattern, { timeout });
  }
}
