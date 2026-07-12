import { EventBus } from "../events/EventBus";
import { EngineEvents } from "../events/EngineEvents";

export class ConfigManager {
    private static _instance: ConfigManager;

    public environmentMode: "development" | "production" = "development";
    
    // Graphics Settings
    private _graphicsQuality: "low" | "medium" | "high" = "high";
    private _msaaSamples: number = 4;
    private _shadowQuality: "low" | "medium" | "high" = "high";
    private _hdrEnabled: boolean = true;
    private _debugMode: boolean = false;
    private _theme: "dark" | "light" = "dark";

    private constructor() {
        this._loadSettings();
    }

    public static initialize(): ConfigManager {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
        }
        return ConfigManager._instance;
    }

    public static get instance(): ConfigManager {
        if (!ConfigManager._instance) {
            throw new Error("ConfigManager not initialized.");
        }
        return ConfigManager._instance;
    }

    private _loadSettings(): void {
        const saved = localStorage.getItem("bv_settings");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.graphicsQuality) this._graphicsQuality = parsed.graphicsQuality;
                if (parsed.msaaSamples) this._msaaSamples = parsed.msaaSamples;
                if (parsed.shadowQuality) this._shadowQuality = parsed.shadowQuality;
                if (parsed.hdrEnabled !== undefined) this._hdrEnabled = parsed.hdrEnabled;
                if (parsed.debugMode !== undefined) this._debugMode = parsed.debugMode;
                if (parsed.theme) this._theme = parsed.theme;
            } catch (e) {
                console.error("Failed to parse saved settings", e);
            }
        }
    }

    public saveSettings(): void {
        const settings = {
            graphicsQuality: this._graphicsQuality,
            msaaSamples: this._msaaSamples,
            shadowQuality: this._shadowQuality,
            hdrEnabled: this._hdrEnabled,
            debugMode: this._debugMode,
            theme: this._theme
        };
        localStorage.setItem("bv_settings", JSON.stringify(settings));
        
        // Notify systems that rely on config changes
        EventBus.instance.emit(EngineEvents.ConfigChanged, settings);
    }

    // Getters and Setters
    get graphicsQuality() { return this._graphicsQuality; }
    set graphicsQuality(val) { this._graphicsQuality = val; this.saveSettings(); }

    get msaaSamples() { return this._msaaSamples; }
    set msaaSamples(val) { this._msaaSamples = val; this.saveSettings(); }

    get shadowQuality() { return this._shadowQuality; }
    set shadowQuality(val) { this._shadowQuality = val; this.saveSettings(); }

    get hdrEnabled() { return this._hdrEnabled; }
    set hdrEnabled(val) { this._hdrEnabled = val; this.saveSettings(); }

    get debugMode() { return this._debugMode; }
    set debugMode(val) { 
        this._debugMode = val; 
        this.saveSettings(); 
        EventBus.instance.emit(EngineEvents.DebugToggled, { enabled: val });
    }

    get theme() { return this._theme; }
    set theme(val) { this._theme = val; this.saveSettings(); }
}
