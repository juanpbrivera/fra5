import * as fs from "fs";
import * as path from "path";
import { DefaultConfig } from "./DefaultConfig";
import { WebConfig } from "./types";
import { LoggerFactory } from "../logging/LoggerFactory";

/**
 * Gestor centralizado de configuración del framework.
 * 
 * TIMEOUTS JERÁRQUICOS:
 * Los timeouts se manejan de forma centralizada con jerarquía automática:
 * 
 * 1. getCucumberTimeout()   → timeout base (100%) - El MÁS GRANDE
 * 2. getPlaywrightTimeout() → timeout * 0.83 (83%)
 * 3. getAssertionTimeout()  → timeout * 0.75 (75%)
 * 4. getStepTimeout()       → timeout * 0.50 (50%) - El MÁS CHICO
 * 
 * Esto garantiza que cada capa tenga tiempo de dar su mensaje de error
 * ANTES de que la capa superior mate la promesa.
 * 
 * @example
 * ```typescript
 * // Cargar config de cert.json
 * ConfigManager.load('cert');
 * 
 * // En hooks.ts
 * setDefaultTimeout(ConfigManager.getCucumberTimeout());
 * 
 * // En Assertions.ts
 * const timeout = ConfigManager.getAssertionTimeout();
 * 
 * // En PageObject.ts
 * await this.page.waitForTimeout(ConfigManager.getPlaywrightTimeout());
 * ```
 */
export class ConfigManager {
    private static _config?: WebConfig;
    private static readonly logger = LoggerFactory.getLogger('ConfigManager');
    
    private constructor() { }

    /**
     * Carga la configuración desde un archivo JSON del ambiente especificado.
     * 
     * @param env - Nombre del ambiente ('cert' | 'desa' | 'prod' | 'local')
     * @returns Configuración completa combinada
     */
    public static load(env?: string): WebConfig {
        if (this._config) {
            this.logger.debug('Configuración ya cargada, retornando cache');
            return this._config;
        }

        const envName = env ?? process.env.ENV ?? DefaultConfig.env;
        const file = path.resolve(process.cwd(), "config", `${envName}.json`);

        let fileCfg: Partial<WebConfig> = {};
        
        if (fs.existsSync(file)) {
            try {
                const content = fs.readFileSync(file, "utf-8");
                fileCfg = JSON.parse(content);
                this.logger.info({ env: envName, file }, 'Configuración cargada desde archivo');
            } catch (error) {
                this.logger.error({ error, file }, 'Error al parsear archivo de configuración');
                throw new Error(`Archivo de configuración malformado: ${file}`);
            }
        } else {
            this.logger.warn({ file }, 'Archivo de configuración no encontrado, usando DefaultConfig');
        }

        // Merge de configuraciones
        this._config = { 
            ...DefaultConfig, 
            ...fileCfg,
            // Asegurar que timeoutMultipliers siempre exista
            timeoutMultipliers: {
                ...DefaultConfig.timeoutMultipliers,
                ...(fileCfg.timeoutMultipliers || {})
            }
        } as WebConfig;
        
        // Log de timeouts calculados
        this.logger.info({ 
            env: this._config.env,
            baseUrl: this._config.baseUrl,
            browser: this._config.browser,
            headless: this._config.headless,
            timeouts: {
                cucumber: this.getCucumberTimeout(),
                playwright: this.getPlaywrightTimeout(),
                assertion: this.getAssertionTimeout(),
                step: this.getStepTimeout()
            }
        }, 'Configuración final aplicada con timeouts jerárquicos');
        
        return this._config;
    }

    /**
     * Obtiene la configuración actual.
     * Si no existe, carga automáticamente.
     */
    public static get(): WebConfig {
        return this._config ?? this.load();
    }

    /**
     * Sobrescribe valores de configuración en runtime.
     * 
     * @param partial - Objeto con propiedades a sobrescribir
     */
    public static override(partial: Partial<WebConfig>): void {
        this._config = { ...this.get(), ...partial };
        this.logger.info({ overrides: partial }, 'Configuración sobrescrita');
    }

    /**
     * Resetea la configuración cargada.
     * @internal
     */
    public static reset(): void {
        this._config = undefined;
        this.logger.debug('Configuración reseteada');
    }

    // ===== MÉTODOS DE TIMEOUT JERÁRQUICO =====

    /**
     * Obtiene el timeout de Cucumber (el más grande de la jerarquía).
     * 
     * Este es el timeout base del cual se calculan los demás.
     * 
     * @returns Timeout en milisegundos
     * 
     * @example
     * ```typescript
     * // En hooks.ts
     * import { ConfigManager } from '@automation/web-automation-framework';
     * 
     * setDefaultTimeout(ConfigManager.getCucumberTimeout()); // 60000ms
     * ```
     */
    public static getCucumberTimeout(): number {
        const config = this.get();
        return config.timeout || 60000;
    }

    /**
     * Obtiene el timeout de Playwright (83% del timeout base).
     * 
     * Usado para navegación, esperas de elementos, etc.
     * 
     * @returns Timeout en milisegundos
     * 
     * @example
     * ```typescript
     * const timeout = ConfigManager.getPlaywrightTimeout(); // 50000ms
     * await page.waitForSelector('.element', { timeout });
     * ```
     */
    public static getPlaywrightTimeout(): number {
        const config = this.get();
        const baseTimeout = config.timeout || 60000;
        const multiplier = config.timeoutMultipliers?.playwright ?? 0.83;
        return Math.floor(baseTimeout * multiplier);
    }

    /**
     * Obtiene el timeout de Assertions (75% del timeout base).
     * 
     * Usado para expect, verificaciones, etc.
     * 
     * @returns Timeout en milisegundos
     * 
     * @example
     * ```typescript
     * const timeout = ConfigManager.getAssertionTimeout(); // 45000ms
     * await expect(locator).toBeVisible({ timeout });
     * ```
     */
    public static getAssertionTimeout(): number {
        const config = this.get();
        const baseTimeout = config.timeout || 60000;
        const multiplier = config.timeoutMultipliers?.assertion ?? 0.75;
        return Math.floor(baseTimeout * multiplier);
    }

    /**
     * Obtiene el timeout de Steps individuales (50% del timeout base).
     * 
     * Usado para acciones cortas, clicks, fills, etc.
     * 
     * @returns Timeout en milisegundos
     * 
     * @example
     * ```typescript
     * const timeout = ConfigManager.getStepTimeout(); // 30000ms
     * await element.click({ timeout });
     * ```
     */
    public static getStepTimeout(): number {
        const config = this.get();
        const baseTimeout = config.timeout || 60000;
        const multiplier = config.timeoutMultipliers?.step ?? 0.50;
        return Math.floor(baseTimeout * multiplier);
    }

    /**
     * Obtiene todos los timeouts calculados.
     * Útil para logging y debugging.
     * 
     * @returns Objeto con todos los timeouts
     */
    public static getAllTimeouts(): {
        cucumber: number;
        playwright: number;
        assertion: number;
        step: number;
    } {
        return {
            cucumber: this.getCucumberTimeout(),
            playwright: this.getPlaywrightTimeout(),
            assertion: this.getAssertionTimeout(),
            step: this.getStepTimeout()
        };
    }
}