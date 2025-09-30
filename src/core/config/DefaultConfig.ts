import { WebConfig } from "./types";


export const DefaultConfig: WebConfig = {
    env: process.env.ENV ?? "desa",
    baseUrl: process.env.BASE_URL ?? "https://example.com",
    browser: (process.env.BROWSER as any) ?? "chromium",
    headless: process.env.HEADLESS === "false" ? false : true,
    trace: (process.env.TRACE as any) ?? "retain-on-failure",
    video: process.env.VIDEO === "true",
    screenshotOnFailure: true,
    contextOptions: {
        viewport: { width: 1366, height: 768 },
        locale: "es-PE",
        storageStatePath: process.env.STORAGE_STATE
    }
};