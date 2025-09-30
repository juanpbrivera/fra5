import { expect, Locator, Page } from "@playwright/test";


export const toExist = async (locator: Locator) => expect(locator).toBeAttached();
export const toBeVisible = async (locator: Locator) => expect(locator).toBeVisible();
export const toHaveText = async (locator: Locator, text: string | RegExp) => expect(locator).toHaveText(text);
export const urlIncludes = async (page: Page, fragment: string | RegExp) => expect(page).toHaveURL(fragment);