import { ConfigManager } from "../config/ConfigManager";
import { EngineManager } from "../engine/EngineManager";
import { RendererManager } from "../engine/RendererManager";
import { SceneManager } from "../scene/SceneManager";
import { CameraManager } from "../camera/CameraManager";
import { AssetManager } from "../assets/AssetManager";
import { DebugManager } from "../debug/DebugManager";
import { PerformanceManager } from "../debug/PerformanceManager";
import { LightingManager } from "../lighting/LightingManager";
import { EnvironmentManager } from "../environment/EnvironmentManager";
import { MaterialManager } from "../materials/MaterialManager";
import { GUIManager } from "../gui/GUIManager";
import { InteractionManager } from "../scene/InteractionManager";
import { InputManager } from "../scene/InputManager";
import { NavigationManager } from "./NavigationManager";
import { StudioManager } from "../plugins/StudioManager";
import { EventBus } from "../events/EventBus";
import { StateManager } from "../state/StateManager";

import { HomeStudio } from "../../studios/HomeStudio";
import { ModelsStudio } from "../../studios/ModelsStudio";
import { MaterialsStudio } from "../../studios/MaterialsStudio";
import { LightingStudio } from "../../studios/LightingStudio";
import { CamerasStudio } from "../../studios/CamerasStudio";
import { PhysicsStudio } from "../../studios/PhysicsStudio";
import { EnvironmentStudio } from "../../studios/EnvironmentStudio";
import { EffectsStudio } from "../../studios/EffectsStudio";
import { PerformanceStudio } from "../../studios/PerformanceStudio";

export class AppManager {
    private static _instance: AppManager;

    private constructor() {}

    public static initialize(): AppManager {
        if (!AppManager._instance) {
            AppManager._instance = new AppManager();
        }
        return AppManager._instance;
    }

    public static get instance(): AppManager {
        if (!AppManager._instance) {
            throw new Error("AppManager not initialized.");
        }
        return AppManager._instance;
    }

    public bootstrap(): void {
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        if (!canvas) {
            console.error("❌ Render canvas not found in Viewport!");
            return;
        }

        try {
            // 1. Data & Events Layer
            ConfigManager.initialize();
            EventBus.initialize();
            StateManager.initialize();

            // 2. Core Engine Layer
            EngineManager.initialize(canvas);
            const sceneManager = SceneManager.initialize();
            sceneManager.setActiveScene(sceneManager.createScene()); // Fallback scene
            RendererManager.initialize();

            // 3. Core Managers
            CameraManager.initialize();
            AssetManager.initialize();
            GUIManager.initialize();
            InputManager.initialize();
            InteractionManager.initialize();

            // 4. Content Managers
            LightingManager.initialize();
            EnvironmentManager.initialize();
            MaterialManager.initialize();

            // 5. Debug & Performance
            PerformanceManager.initialize();
            DebugManager.initialize();

            // 6. UI & Navigation Layer
            NavigationManager.initialize();

            // 7. Plugin System (Studios)
            const studioManager = StudioManager.initialize();
            
            // Register all studios
            studioManager.registerStudio(new HomeStudio());
            studioManager.registerStudio(new ModelsStudio());
            studioManager.registerStudio(new MaterialsStudio());
            studioManager.registerStudio(new LightingStudio());
            studioManager.registerStudio(new CamerasStudio());
            studioManager.registerStudio(new PhysicsStudio());
            studioManager.registerStudio(new EnvironmentStudio());
            studioManager.registerStudio(new EffectsStudio());
            studioManager.registerStudio(new PerformanceStudio());

            console.log("✓ Engine Core v0.5.0 Bootstrapped Successfully");

            // 8. Start Render Loop
            sceneManager.startRenderLoop();
            
            // 9. Mount Initial Studio (Home)
            studioManager.activateStudio("Home");

        } catch (error) {
            console.error("❌ Fatal Error during Engine bootstrap:", error);
        }
    }
}

