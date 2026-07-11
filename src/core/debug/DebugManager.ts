import { SceneManager } from "../scene/SceneManager";
import { EngineManager } from "../engine/EngineManager";
import { ConfigManager } from "../config/ConfigManager";
import { Logger } from "../../utilities/Logger";

// Ensure debug dependencies are bundled
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

export class DebugManager {
    private static _instance: DebugManager;
    private _inspectorVisible: boolean = false;
    private _fpsOverlay: HTMLDivElement | null = null;
    private _fpsUpdateInterval: number | null = null;

    private constructor() {}

    public static initialize(): DebugManager {
        if (!DebugManager._instance) {
            DebugManager._instance = new DebugManager();
        }
        return DebugManager._instance;
    }

    public static get instance(): DebugManager {
        if (!DebugManager._instance) {
            throw new Error("DebugManager has not been initialized. Call initialize() first.");
        }
        return DebugManager._instance;
    }

    /**
     * Toggles the native Babylon.js Inspector.
     */
    public toggleInspector(): void {
        const config = ConfigManager.instance;
        
        if (config.environmentMode === "production" && !config.debugMode) {
            Logger.instance.warn("Cannot open inspector in production mode.");
            return;
        }

        const scene = SceneManager.instance.scene;
        
        if (this._inspectorVisible) {
            scene.debugLayer.hide();
            this._inspectorVisible = false;
            Logger.instance.debug("Inspector hidden.");
        } else {
            scene.debugLayer.show({
                embedMode: true
            }).then(() => {
                this._inspectorVisible = true;
                Logger.instance.debug("Inspector shown.");
            });
        }
    }

    /**
     * Shows a DOM-based FPS counter and debug info overlay.
     */
    public showDebugOverlay(): void {
        const config = ConfigManager.instance;
        
        if (config.environmentMode === "production" && !config.debugMode) {
            return;
        }

        if (this._fpsOverlay) {
            return; // Already visible
        }

        this._fpsOverlay = document.createElement("div");
        this._fpsOverlay.id = "babylon-debug-overlay";
        Object.assign(this._fpsOverlay.style, {
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#00ff00",
            padding: "10px 15px",
            fontFamily: "monospace",
            fontSize: "14px",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: "9999",
            border: "1px solid #00ff00",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
        });

        document.body.appendChild(this._fpsOverlay);
        const engine = EngineManager.instance.engine;

        this._fpsUpdateInterval = window.setInterval(() => {
            if (this._fpsOverlay) {
                const fps = engine.getFps().toFixed(1);
                this._fpsOverlay.innerHTML = `
                    <strong style="color:#fff;">BabylonVerse Debug</strong><br/>
                    FPS: ${fps}
                `;
            }
        }, 500);

        Logger.instance.debug("Debug overlay shown.");
    }

    /**
     * Hides the DOM-based debug overlay.
     */
    public hideDebugOverlay(): void {
        if (this._fpsUpdateInterval !== null) {
            clearInterval(this._fpsUpdateInterval);
            this._fpsUpdateInterval = null;
        }

        if (this._fpsOverlay && this._fpsOverlay.parentNode) {
            this._fpsOverlay.parentNode.removeChild(this._fpsOverlay);
            this._fpsOverlay = null;
        }

        Logger.instance.debug("Debug overlay hidden.");
    }
    
    /**
     * Sets up keyboard shortcuts for development mode.
     * Shift + I : Toggle Inspector
     * Shift + D : Toggle Debug Overlay
     */
    public setupKeyboardBindings(): void {
        const config = ConfigManager.instance;
        if (config.environmentMode === "production" && !config.debugMode) {
            return;
        }
        
        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.key.toLowerCase() === "i") {
                this.toggleInspector();
            }
            if (ev.shiftKey && ev.key.toLowerCase() === "d") {
                if (this._fpsOverlay) {
                    this.hideDebugOverlay();
                } else {
                    this.showDebugOverlay();
                }
            }
        });
        
        Logger.instance.debug("Debug bindings initialized (Shift+I: Inspector, Shift+D: Overlay).");
    }
}
