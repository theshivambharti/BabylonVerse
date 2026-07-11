import { ConfigManager } from "../core/config/ConfigManager";

export class Logger {
    private static _instance: Logger;

    private constructor() {}

    public static get instance(): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }

    /**
     * Logs informational messages.
     */
    public info(message: string, ...optionalParams: any[]): void {
        console.info(`[BabylonVerse INFO]: ${message}`, ...optionalParams);
    }

    /**
     * Logs warning messages.
     */
    public warn(message: string, ...optionalParams: any[]): void {
        console.warn(`[BabylonVerse WARN]: ${message}`, ...optionalParams);
    }

    /**
     * Logs error messages.
     */
    public error(message: string, ...optionalParams: any[]): void {
        console.error(`[BabylonVerse ERROR]: ${message}`, ...optionalParams);
    }

    /**
     * Logs debug messages. Ignored if the environment is set to production,
     * unless debugMode is explicitly forced in ConfigManager.
     */
    public debug(message: string, ...optionalParams: any[]): void {
        const config = ConfigManager.instance;
        
        // Disable debug logs in production
        if (config.environmentMode === "production" && !config.debugMode) {
            return;
        }

        console.debug(`[BabylonVerse DEBUG]: ${message}`, ...optionalParams);
    }
}
