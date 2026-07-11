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

export class ShowcaseManager {
    private static _instance: ShowcaseManager;
    private _currentShowcase: IShowcase | null = null;
    
    private _showcases: Map<string, IShowcase> = new Map();

    private constructor() {
        this._showcases.set("Home", new HomeShowcase());
        this._showcases.set("Models", new ModelsShowcase());
        this._showcases.set("Materials", new MaterialsShowcase());
        this._showcases.set("Lighting", new LightingShowcase());
        this._showcases.set("Cameras", new CamerasShowcase());
        this._showcases.set("Physics", new PhysicsShowcase());
        this._showcases.set("Environment", new EnvironmentShowcase());
        this._showcases.set("Effects", new EffectsShowcase());
        this._showcases.set("Performance", new PerformanceShowcase());
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
        }

        const showcase = this._showcases.get(name);
        
        if (showcase) {
            this._currentShowcase = showcase;
            await this._currentShowcase.load();
        } else {
            console.warn(`Showcase ${name} not found in ShowcaseManager.`);
        }
    }
}
