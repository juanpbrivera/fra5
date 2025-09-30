import * as fs from "fs";
import * as path from "path";
import { DefaultConfig } from "./DefaultConfig";
import { WebConfig } from "./types";


export class ConfigManager {
    private static _config?: WebConfig;
    private constructor() { }


    public static load(env?: string): WebConfig {
        if (this._config) return this._config;
        const envName = env ?? process.env.ENV ?? DefaultConfig.env;
        const file = path.resolve(process.cwd(), "config", `${envName}.json`);


        let fileCfg: Partial<WebConfig> = {};
        if (fs.existsSync(file)) {
            fileCfg = JSON.parse(fs.readFileSync(file, "utf-8"));
        }


        // Merge simple (shallow). Si necesitas más profundidad, usa deep merge.
        this._config = { ...DefaultConfig, ...fileCfg } as WebConfig;
        return this._config;
    }


    public static get(): WebConfig {
        return this._config ?? this.load();
    }


    public static override(partial: Partial<WebConfig>) {
        this._config = { ...this.get(), ...partial };
    }
}