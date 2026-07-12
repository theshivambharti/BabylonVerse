import { IShowcase } from "../interfaces/IShowcase";
import { HomeShowcase } from "../../showcases/HomeShowcase";
import { ModelsShowcase } from "../../showcases/ModelsShowcase";
import { MaterialsShowcase } from "../../showcases/MaterialsShowcase";
import { LightingShowcase } from "../../showcases/LightingShowcase";
import { CamerasShowcase } from "../../showcases/CamerasShowcase";
import { PhysicsShowcase } from "../../showcases/PhysicsShowcase";
import { EnvironmentShowcase } from "../../showcases/EnvironmentShowcase";
import { EffectsShowcase } from "../../showcases/EffectsShowcase";
import { PerformanceShowcase } from "../../showcases/PerformanceShowcase";

import { LightingManager } from "../lighting/LightingManager";
import { GUIManager } from "../gui/GUIManager";
import { CameraManager } from "../camera/CameraManager";

export class ShowcaseManager {
    private static _instance: ShowcaseManager;
    private _currentShowcase: IShowcase | null = null;
    
    private _showcaseFactories: Map<string, () => IShowcase> = new Map();

    private constructor() {
        this._showcaseFactories.set("Home", () => new HomeShowcase());
        this._showcaseFactories.set("Models", () => new ModelsShowcase());
        this._showcaseFactories.set("Materials", () => new MaterialsShowcase());
        this._showcaseFactories.set("Lighting", () => new LightingShowcase());
        this._showcaseFactories.set("Cameras", () => new CamerasShowcase());
        this._showcaseFactories.set("Physics", () => new PhysicsShowcase());
        this._showcaseFactories.set("Environment", () => new EnvironmentShowcase());
        this._showcaseFactories.set("Effects", () => new EffectsShowcase());
        this._showcaseFactories.set("Performance", () => new PerformanceShowcase());
    }

    public static initialize(): ShowcaseManager {
        if (!ShowcaseManager._instance) {
            ShowcaseManager._instance = new ShowcaseManager();
        }
        return ShowcaseManager._instance;
    }

    public static get instance(): ShowcaseManager {
        if (!ShowcaseManager._instance) {
            throw new Error("ShowcaseManager not initialized. Call initialize() first.");
        }
        return ShowcaseManager._instance;
    }

    /**
     * Loads a requested showcase by name.
     */
    public async loadShowcase(name: string): Promise<void> {
        // Unload previous gracefully
        if (this._currentShowcase) {
            this._currentShowcase.unload();
            this._currentShowcase = null;
            
            // Clear context from singleton managers to prevent memory leaks
            LightingManager.instance.clearSceneContext();
            GUIManager.instance.clearSceneContext();
            CameraManager.instance.clearSceneContext();
        }

        const factory = this._showcaseFactories.get(name);
        
        if (factory) {
            this._currentShowcase = factory();
            await this._currentShowcase.load();
        } else {
            console.warn(`Showcase ${name} not found in ShowcaseManager.`);
        }
    }
}
