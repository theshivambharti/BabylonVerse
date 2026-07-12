import { EngineManager } from "../engine/EngineManager";
import { SceneManager } from "../scene/SceneManager";
import { Scene } from "@babylonjs/core/scene";

export class PerformanceManager {
    private static _instance: PerformanceManager;

    private constructor() {}

    public static initialize(): PerformanceManager {
        if (!PerformanceManager._instance) {
            PerformanceManager._instance = new PerformanceManager();
        }
        return PerformanceManager._instance;
    }

    public static get instance(): PerformanceManager {
        if (!PerformanceManager._instance) {
            throw new Error("PerformanceManager not initialized.");
        }
        return PerformanceManager._instance;
    }

    public getFPS(): number {
        return EngineManager.instance.engine.getFps();
    }

    public getDrawCalls(scene?: Scene): number {
        const s = scene || SceneManager.instance.scene;
        return s ? (s.getEngine() as any)._drawCalls || 0 : 0;
    }

    public getActiveMeshes(scene?: Scene): number {
        const s = scene || SceneManager.instance.scene;
        return s ? s.getActiveMeshes().length : 0;
    }

    public getActiveIndices(scene?: Scene): number {
        const s = scene || SceneManager.instance.scene;
        return s ? s.getActiveIndices() : 0;
    }

    public getTextureCount(scene?: Scene): number {
        const s = scene || SceneManager.instance.scene;
        return s ? s.getEngine().getLoadedTexturesCache().length : 0;
    }
}

