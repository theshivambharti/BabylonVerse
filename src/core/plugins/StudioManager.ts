import { IStudioPlugin } from "./IStudioPlugin";
import { EventBus } from "../events/EventBus";
import { EngineEvents } from "../events/EngineEvents";
import { LightingManager } from "../lighting/LightingManager";
import { GUIManager } from "../gui/GUIManager";
import { CameraManager } from "../camera/CameraManager";
import { Logger } from "../../utilities/Logger";

export class StudioManager {
    private static _instance: StudioManager;
    private _plugins: Map<string, IStudioPlugin> = new Map();
    private _activeStudio: IStudioPlugin | null = null;

    private constructor() {}

    public static initialize(): StudioManager {
        if (!StudioManager._instance) {
            StudioManager._instance = new StudioManager();
        }
        return StudioManager._instance;
    }

    public static get instance(): StudioManager {
        if (!StudioManager._instance) {
            throw new Error("StudioManager not initialized.");
        }
        return StudioManager._instance;
    }

    public registerStudio(plugin: IStudioPlugin): void {
        if (this._plugins.has(plugin.name)) {
            Logger.instance.warn(`Studio ${plugin.name} is already registered.`);
            return;
        }
        this._plugins.set(plugin.name, plugin);
    }

    public unregisterStudio(name: string): void {
        if (this._activeStudio?.name === name) {
            this.deactivateStudio();
        }
        this._plugins.delete(name);
    }

    public async activateStudio(name: string): Promise<void> {
        if (this._activeStudio?.name === name) return;

        this.deactivateStudio();

        const plugin = this._plugins.get(name);
        if (!plugin) {
            Logger.instance.error(`Studio ${name} not found.`);
            return;
        }

        try {
            this._activeStudio = plugin;
            await plugin.install();
            await plugin.activate();

            EventBus.instance.emit(EngineEvents.StudioActivated, { studioName: name });
        } catch (error) {
            Logger.instance.error(`Failed to activate studio ${name}`, error);
            this._activeStudio = null;
        }
    }

    public deactivateStudio(): void {
        if (this._activeStudio) {
            this._activeStudio.deactivate();
            
            // Central cleanup to prevent memory leaks across studios
            LightingManager.instance.clearSceneContext();
            GUIManager.instance.clearSceneContext();
            CameraManager.instance.clearSceneContext();

            EventBus.instance.emit(EngineEvents.StudioDeactivated, { studioName: this._activeStudio.name });
            this._activeStudio = null;
        }
    }
}

