import { Page } from '@playwright/test';
import { ScreenshotHelper } from '../../../utilities/ScreenshotHelper';
import { LoggerFactory } from '../../logging/LoggerFactory';

const log = LoggerFactory.getLogger('ReportingInterceptor');

export function attachReporting(page: Page, scenarioName: string) {
    page.on('console', msg => {
        log.info({ type: msg.type(), text: msg.text() }, 'console');
    });

    page.on('pageerror', err => {
        log.error({ err }, 'pageerror');
    });

    page.on('request', req => {
        log.info({ method: req.method(), url: req.url() }, 'request');
    });

    page.on('response', res => {
        log.info({ status: res.status(), url: res.url() }, 'response');
    });

    // helper para hooks: llamar si el escenario falla
    (page as any)._captureFailure = async () => {
        await ScreenshotHelper.capture(page, scenarioName.replace(/\s+/g, '_'));
    };
}

// utilidad opcional para After hook
export async function captureOnFailure(page: Page, failed: boolean, name: string) {
    if (failed && (page as any)._captureFailure) {
        await (page as any)._captureFailure();
    }
}
