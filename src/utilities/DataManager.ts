import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { LoggerFactory } from '../core/logging/LoggerFactory';

const logger = LoggerFactory.getLogger('DataManager');

/**
 * Gestor genérico de datos desde archivos CSV.
 * 
 * Soporta lectura, filtrado y cache de cualquier CSV del proyecto.
 * 
 * @example
 * ```typescript
 * // Leer credenciales
 * const vendedor = await DataManager.obtenerFila('credenciales', { 
 *   rol: 'vendedor', 
 *   ambiente: 'cert' 
 * });
 * 
 * // Leer cuentas
 * const cuenta = await DataManager.obtenerFila('cuentas', { 
 *   tipo: 'valida', 
 *   moneda: 'PEN' 
 * });
 * 
 * // Leer todas las filas de un CSV
 * const todasLasCuentas = await DataManager.obtenerTodasLasFilas('cuentas');
 * ```
 */
export class DataManager {
    private static readonly cache: Map<string, any[]> = new Map();
    private static dataPath = path.join(process.cwd(), 'data');

    /**
     * Obtiene una fila de un CSV filtrada por columnas.
     * 
     * @param csvName - Nombre del archivo CSV (sin extensión)
     * @param filters - Objeto con filtros { columna: valor }
     * @returns Primera fila que coincide con los filtros
     * @throws Error si no se encuentra el archivo o la fila
     * 
     * @example
     * ```typescript
     * // Busca en data/credenciales.csv donde rol='vendedor' Y ambiente='cert'
     * const vendedor = await DataManager.obtenerFila('credenciales', { 
     *   rol: 'vendedor', 
     *   ambiente: 'cert' 
     * });
     * ```
     */
    public static async obtenerFila<T = any>(csvName: string, filters?: Record<string, any>): Promise<T> {
        const data = await this.leerCSV<T>(csvName);

        if (!filters || Object.keys(filters).length === 0) {
            if (data.length === 0) {
                throw new Error(`CSV '${csvName}.csv' está vacío`);
            }
            return data[0];
        }

        const resultado = data.find(row => 
            Object.entries(filters).every(([key, value]) => {
                const rowValue = (row as any)[key];
                // Comparación case-insensitive para strings
                if (typeof rowValue === 'string' && typeof value === 'string') {
                    return rowValue.toLowerCase() === value.toLowerCase();
                }
                return rowValue === value;
            })
        );

        if (!resultado) {
            const filterStr = JSON.stringify(filters);
            throw new Error(
                `No se encontró fila en '${csvName}.csv' con filtros: ${filterStr}\n` +
                `Verifica que existe una fila con esos valores en data/${csvName}.csv`
            );
        }

        return resultado;
    }

    /**
     * Obtiene todas las filas de un CSV.
     * 
     * @param csvName - Nombre del archivo CSV (sin extensión)
     * @param filters - (Opcional) Filtros para obtener solo filas específicas
     * @returns Array con todas las filas (o filtradas)
     * 
     * @example
     * ```typescript
     * // Todas las filas
     * const todas = await DataManager.obtenerTodasLasFilas('credenciales');
     * 
     * // Solo del ambiente 'cert'
     * const cert = await DataManager.obtenerTodasLasFilas('credenciales', { ambiente: 'cert' });
     * ```
     */
    public static async obtenerTodasLasFilas<T = any>(
        csvName: string, 
        filters?: Record<string, any>
    ): Promise<T[]> {
        const data = await this.leerCSV<T>(csvName);

        if (!filters || Object.keys(filters).length === 0) {
            return data;
        }

        return data.filter(row =>
            Object.entries(filters).every(([key, value]) => {
                const rowValue = (row as any)[key];
                if (typeof rowValue === 'string' && typeof value === 'string') {
                    return rowValue.toLowerCase() === value.toLowerCase();
                }
                return rowValue === value;
            })
        );
    }

    /**
     * Obtiene un valor específico de una fila.
     * 
     * @param csvName - Nombre del CSV
     * @param filters - Filtros para encontrar la fila
     * @param column - Nombre de la columna a retornar
     * @returns Valor de la columna
     * 
     * @example
     * ```typescript
     * const usuario = await DataManager.obtenerValor(
     *   'credenciales', 
     *   { rol: 'vendedor', ambiente: 'cert' }, 
     *   'usuario'
     * );
     * // Retorna: "VendedorBanco"
     * ```
     */
    public static async obtenerValor<T = any>(
        csvName: string,
        filters: Record<string, any>,
        column: string
    ): Promise<T> {
        const fila = await this.obtenerFila(csvName, filters);
        const valor = (fila as any)[column];

        if (valor === undefined) {
            throw new Error(
                `Columna '${column}' no existe en '${csvName}.csv'\n` +
                `Columnas disponibles: ${Object.keys(fila as any).join(', ')}`
            );
        }

        return valor as T;
    }

    /**
     * Lee y parsea un archivo CSV usando csv-parser.
     * Usa cache para evitar lecturas repetidas.
     * 
     * @param csvName - Nombre del archivo CSV (sin extensión)
     * @returns Array de objetos parseados
     * @private
     */
    private static async leerCSV<T = any>(csvName: string): Promise<T[]> {
        // Verificar cache
        if (this.cache.has(csvName)) {
            logger.debug({ csvName }, 'CSV cargado desde cache');
            return this.cache.get(csvName)!;
        }

        const csvPath = path.join(this.dataPath, `${csvName}.csv`);

        if (!fs.existsSync(csvPath)) {
            throw new Error(
                `Archivo CSV no encontrado: ${csvPath}\n` +
                `Crea el archivo: data/${csvName}.csv`
            );
        }

        return new Promise<T[]>((resolve, reject) => {
            const results: T[] = [];

            fs.createReadStream(csvPath)
                .pipe(csvParser({
                    mapHeaders: ({ header }) => header.trim(),
                    mapValues: ({ value }) => {
                        // Trim strings
                        if (typeof value === 'string') {
                            return value.trim();
                        }
                        return value;
                    }
                }))
                .on('data', (data: T) => results.push(data))
                .on('end', () => {
                    // Guardar en cache
                    this.cache.set(csvName, results);

                    logger.info({ 
                        csvName, 
                        rows: results.length,
                        columns: Object.keys(results[0] || {})
                    }, 'CSV cargado exitosamente');

                    resolve(results);
                })
                .on('error', (error: Error) => {
                    reject(new Error(
                        `Error leyendo CSV '${csvName}.csv': ${error.message}\n` +
                        `Verifica que el formato sea correcto.`
                    ));
                });
        });
    }

    /**
     * Limpia el cache de CSVs.
     * Útil para tests o cuando se modifican los archivos.
     */
    public static limpiarCache(): void {
        this.cache.clear();
        logger.debug('Cache de CSVs limpiado');
    }

    /**
     * Configura una ruta personalizada para los CSVs.
     * Por defecto es: {proyecto}/data/
     * 
     * @param customPath - Ruta absoluta o relativa al proyecto
     */
    public static configurarRutaData(customPath: string): void {
        if (path.isAbsolute(customPath)) {
            this.dataPath = customPath;
        } else {
            this.dataPath = path.join(process.cwd(), customPath);
        }
        logger.info({ dataPath: this.dataPath }, 'Ruta de data configurada');
    }
}