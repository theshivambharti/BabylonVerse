import { SceneManager } from "../scene/SceneManager";
import { PerformanceManager } from "./PerformanceManager";
import { EventBus } from "../events/EventBus";
import { EngineEvents } from "../events/EngineEvents";
import { Logger } from "../../utilities/Logger";

// Ensure debug dependencies are bundled
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

export class DebugManager {
    private static _instance: DebugManager;
    private _inspectorVisible: boolean = false;
    private _updateInterval: number | null = null;

    private constructor() {}

    public static initialize(): DebugManager {
        if (!DebugManager._instance) {
            DebugManager._instance = new DebugManager();
            DebugManager._instance._setupEventListeners();
        }
        return DebugManager._instance;
    }

    public static get instance(): DebugManager {
        if (!DebugManager._instance) {
            throw new Error("DebugManager not initialized.");
        }
        return DebugManager._instance;
    }

    private _setupEventListeners(): void {
        EventBus.instance.on(EngineEvents.DebugToggled, (payload: any) => {
            if (payload.enabled) {
                this.startPerformanceMonitoring();
            } else {
                this.stopPerformanceMonitoring();
            }
        });

        // Initialize keyboard shortcuts (moved out of InteractionManager into DebugManager)
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.shiftKey && e.altKey && e.key.toLowerCase() === 'i') {
                this.toggleInspector();
            }
        });
    }

    public toggleInspector(): void {
        const scene = SceneManager.instance.scene;
        if (!scene) return;

        if (this._inspectorVisible) {
            scene.debugLayer.hide();
            this._inspectorVisible = false;
            Logger.instance.info("Inspector hidden");
        } else {
            scene.debugLayer.show({
                embedMode: true,
                handleResize: true
            }).then(() => {
                this._inspectorVisible = true;
                Logger.instance.info("Inspector shown");
            }).catch(e => {
                Logger.instance.error("Failed to show Inspector", e);
            });
        }
    }

    public startPerformanceMonitoring(): void {
        if (this._updateInterval) return;

        const perf = PerformanceManager.instance;
        
        // Target status bar
        const statusRight = document.getElementById("status-right");
        
        this._updateInterval = window.setInterval(() => {
            if (statusRight) {
                const fps = perf.getFPS().toFixed(0);
                const drawCalls = perf.getDrawCalls();
                const meshes = perf.getActiveMeshes();
                const indices = perf.getActiveIndices();
                const textures = perf.getTextureCount();
                
                statusRight.innerHTML = `
                    <span class="status-metric">FPS: ${fps}</span>
                    <span class="status-metric">Draws: ${drawCalls}</span>
                    <span class="status-metric">Meshes: ${meshes}</span>
                    <span class="status-metric">Indices: ${indices}</span>
                    <span class="status-metric">Textures: ${textures}</span>
                `;
            }
        }, 1000);
    }

    public stopPerformanceMonitoring(): void {
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = null;
        }
        const statusRight = document.getElementById("status-right");
        if (statusRight) {
            statusRight.innerHTML = "";
        }
    }
}

