import * as fs from "fs";
import * as path from "path";
import { DefaultConfig } from "./DefaultConfig";
import { WebConfig } from "./types";
import { LoggerFactory } from "../logging/LoggerFactory";

/**
 * Gestor centralizado de configuración del framework.
 * 
 * Implementa el patrón Singleton para asegurar una única instancia de configuración
 * durante toda la ejecución. Carga archivos JSON por ambiente y los combina con
 * valores por defecto.
 * 
 * Prioridad de configuración (de menor a mayor):
 * 1. DefaultConfig (valores hardcoded)
 * 2. Archivo JSON del ambiente (config/cert.json, config/desa.json, etc.)
 * 3. Variables de entorno (process.env)
 * 4. override() manual en runtime
 * 
 * @example
 * ```typescript
 * // Cargar configuración de cert.json
 * ConfigManager.load('cert');
 * 
 * // Obtener configuración actual
 * const config = ConfigManager.get();
 * console.log(config.baseUrl); // https://app-cert.example.com
 * 
 * // Sobrescribir en runtime
 * ConfigManager.override({ baseUrl: 'https://localhost:3000' });
 * ```
 */
export class ConfigManager {
    private static _config?: WebConfig;
    private static readonly logger = LoggerFactory.getLogger('ConfigManager');
    
    /**
     * Constructor privado para prevenir instanciación directa.
     * Usa load() o get() para acceder a la configuración.
     */
    private constructor() { }

    /**
     * Carga la configuración desde un archivo JSON del ambiente especificado.
     * 
     * Proceso:
     * 1. Verifica si ya existe configuración cargada (retorna cache)
     * 2. Determina el nombre del ambiente (parámetro > ENV > DefaultConfig)
     * 3. Busca el archivo en ./config/{ambiente}.json
     * 4. Parsea el JSON (si existe)
     * 5. Hace merge con DefaultConfig
     * 6. Cachea el resultado
     * 
     * @param env - Nombre del ambiente ('cert' | 'desa' | 'prod' | 'local')
     * @returns Configuración completa combinada
     * 
     * @throws Error si el archivo JSON está malformado
     * 
     * @example
     * ```typescript
     * // Carga config/cert.json
     * const config = ConfigManager.load('cert');
     * 
     * // Carga desde variable de entorno ENV
     * process.env.ENV = 'desa';
     * const config = ConfigManager.load(); // Usa 'desa'
     * ```
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

        this._config = { ...DefaultConfig, ...fileCfg } as WebConfig;
        
        this.logger.debug({ 
            env: this._config.env,
            baseUrl: this._config.baseUrl,
            browser: this._config.browser,
            headless: this._config.headless
        }, 'Configuración final aplicada');
        
        return this._config;
    }

    /**
     * Obtiene la configuración actual.
     * 
     * Si no existe configuración cargada, llama a load() automáticamente
     * con valores por defecto.
     * 
     * @returns Configuración actual
     * 
     * @example
     * ```typescript
     * const config = ConfigManager.get();
     * await page.goto(config.baseUrl);
     * ```
     */
    public static get(): WebConfig {
        return this._config ?? this.load();
    }

    /**
     * Sobrescribe valores de configuración en runtime.
     * 
     * Útil para casos específicos que necesitan cambiar configuración
     * sin modificar archivos JSON.
     * 
     * @param partial - Objeto con propiedades a sobrescribir
     * 
     * @example
     * ```typescript
     * // Cambiar URL base temporalmente
     * ConfigManager.override({ baseUrl: 'https://localhost:3000' });
     * 
     * // Forzar headless
     * ConfigManager.override({ headless: true });
     * 
     * // Múltiples valores
     * ConfigManager.override({ 
     *   browser: 'firefox',
     *   video: true,
     *   trace: 'on'
     * });
     * ```
     */
    public static override(partial: Partial<WebConfig>): void {
        this._config = { ...this.get(), ...partial };
        this.logger.info({ overrides: partial }, 'Configuración sobrescrita');
    }

    /**
     * Resetea la configuración cargada.
     * Útil para tests que necesitan recargar configuración limpia.
     * 
     * @internal
     */
    public static reset(): void {
        this._config = undefined;
        this.logger.debug('Configuración reseteada');
    }
}