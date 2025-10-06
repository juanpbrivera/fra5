import { chromium, firefox, webkit, Browser, BrowserContext, Page, BrowserType } from "@playwright/test";
import { ConfigManager } from "../config/ConfigManager";
import { BrowserOptions } from "./BrowserOptions";
import { LoggerFactory } from "../logging/LoggerFactory";
import { BrowserName } from "../config/types";


export class BrowserFactory {

    private static getBrowserType(name: BrowserName): BrowserType<Browser> {
        switch (name) {
            case "firefox":
                return firefox;
            case "webkit":
                return webkit;
            default:
                return chromium;
        }
    }

    static async launch(opts?: BrowserOptions): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
        const cfg = ConfigManager.get();
        const log = LoggerFactory.getLogger("BrowserFactory");

        const name = opts?.name ?? cfg.browser;
        const headless = opts?.headless ?? cfg.headless;

        const type = this.getBrowserType(name);

        log.info({ name, headless }, "Iniciando el Navegador");
        const browser = await type.launch({ headless });


        const context = await browser.newContext({
            ...cfg.contextOptions,
            ...opts?.context,
            recordVideo: cfg.video || opts?.video ? { dir: "videos" } : undefined,
            storageState: cfg.contextOptions?.storageStatePath
                ? cfg.contextOptions.storageStatePath
                : undefined
        });


        const page = await context.newPage();


        // Trace según config
        if (cfg.trace && cfg.trace !== "off") {
            await context.tracing.start({ screenshots: true, snapshots: true });
        }


        return { browser, context, page };
    }


    static async gotoBaseUrl(page: Page, relativePath: string = "/"): Promise<void> {
        const cfg = ConfigManager.get();
        await page.goto(new URL(relativePath, cfg.baseUrl).toString());
    }


    static async stop(context: BrowserContext): Promise<void> {
        const cfg = ConfigManager.get();
        if (cfg.trace && cfg.trace !== "off") {
            await context.tracing.stop({ path: `./artifacts/trace-${Date.now()}.zip` });
        }
        await context.close();
    }
}