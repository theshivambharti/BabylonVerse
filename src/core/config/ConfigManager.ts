export enum ShadowQuality {
    LOW = 1024,
    MEDIUM = 2048,
    HIGH = 4096,
    ULTRA = 8192
}

export interface CameraConfig {
    fov: number;
    minZ: number;
    maxZ: number;
    inertia: number;
    speed: number;
}

export interface HDRConfig {
    skyboxSize: number;
    environmentIntensity: number;
    usePMREM: boolean;
}

export class ConfigManager {
    private static _instance: ConfigManager;

    // Configuration properties with production-ready defaults
    private _debugMode: boolean = false;
    private _environmentMode: string = "production";
    private _physicsEnabled: boolean = true;
    private _audioEnabled: boolean = true;
    private _shadowQuality: ShadowQuality = ShadowQuality.HIGH;
    
    private _hdrSettings: HDRConfig = {
        skyboxSize: 1000,
        environmentIntensity: 1.0,
        usePMREM: true
    };
    
    private _cameraDefaults: CameraConfig = {
        fov: 0.8, // radians
        minZ: 0.1,
        maxZ: 1000,
        inertia: 0.9,
        speed: 1.0
    };

    private constructor() {}

    public static initialize(): ConfigManager {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
        }
        return ConfigManager._instance;
    }

    public static get instance(): ConfigManager {
        if (!ConfigManager._instance) {
            throw new Error("ConfigManager has not been initialized. Call initialize() first.");
        }
        return ConfigManager._instance;
    }

    // Getters and Setters
    public get debugMode(): boolean { return this._debugMode; }
    public set debugMode(value: boolean) { this._debugMode = value; }

    public get environmentMode(): string { return this._environmentMode; }
    public set environmentMode(value: string) { this._environmentMode = value; }

    public get physicsEnabled(): boolean { return this._physicsEnabled; }
    public set physicsEnabled(value: boolean) { this._physicsEnabled = value; }

    public get audioEnabled(): boolean { return this._audioEnabled; }
    public set audioEnabled(value: boolean) { this._audioEnabled = value; }

    public get shadowQuality(): ShadowQuality { return this._shadowQuality; }
    public set shadowQuality(value: ShadowQuality) { this._shadowQuality = value; }

    public get hdrSettings(): HDRConfig { return this._hdrSettings; }
    public set hdrSettings(value: Partial<HDRConfig>) { 
        this._hdrSettings = { ...this._hdrSettings, ...value }; 
    }

    public get cameraDefaults(): CameraConfig { return this._cameraDefaults; }
    public set cameraDefaults(value: Partial<CameraConfig>) { 
        this._cameraDefaults = { ...this._cameraDefaults, ...value }; 
    }
}
