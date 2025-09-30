import { BrowserContextOptions } from "@playwright/test";
import { BrowserName } from "@core/config/types";


export interface BrowserOptions {
    name?: BrowserName; // chromium | firefox | webkit
    headless?: boolean;
    trace?: "on" | "off" | "retain-on-failure";
    video?: boolean;
    context?: BrowserContextOptions;
}