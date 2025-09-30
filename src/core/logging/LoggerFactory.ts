import pino, { Logger as PinoLogger } from "pino";

const base = pino({
    level: process.env.LOG_LEVEL ?? "info",
    transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined
});


export class LoggerFactory {
    static getLogger(component: string, extra?: Record<string, any>): PinoLogger {
        return base.child({ component, ...extra });
    }
}