import { ConfigManager } from "../config/ConfigManager";
import { EngineManager } from "../engine/EngineManager";
import { SceneManager } from "../scene/SceneManager";
import { CameraManager } from "../camera/CameraManager";
import { AssetManager } from "../assets/AssetManager";
import { DebugManager } from "../debug/DebugManager";
import { LightingManager } from "../lighting/LightingManager";
import { EnvironmentManager } from "../environment/EnvironmentManager";
import { MaterialManager } from "../materials/MaterialManager";
import { GUIManager } from "../gui/GUIManager";
import { InteractionManager } from "../scene/InteractionManager";
import { ShowcaseManager } from "../scene/ShowcaseManager";
import { NavigationManager } from "./NavigationManager";

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
            throw new Error("AppManager not initialized. Call initialize() first.");
        }
        return AppManager._instance;
    }

    public bootstrap(): void {
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        
        if (!canvas) {
            console.error("❌ Render canvas not found!");
            return;
        }

        try {
            // 1. Initialize Config
            const config = ConfigManager.initialize();
            config.environmentMode = "development";

            // 2. Initialize Core Systems
            EngineManager.initialize(canvas);
            const sceneManager = SceneManager.initialize();
            sceneManager.setActiveScene(sceneManager.createScene()); // Create primary scene container early
            
            CameraManager.initialize();
            AssetManager.initialize();
            GUIManager.initialize();
            
            // 3. Initialize Debug Tools
            const debugManager = DebugManager.initialize();
            debugManager.setupKeyboardBindings();
            debugManager.showDebugOverlay();
            if (config.environmentMode === "development") {
                this._setupDevModeOverlay();
            }

            // 4. Initialize Core Scene Modules
            LightingManager.initialize();
            EnvironmentManager.initialize();
            MaterialManager.initialize();
            InteractionManager.initialize();

            // 5. Initialize Application Routers / Managers
            ShowcaseManager.initialize();
            const navManager = NavigationManager.initialize();
            
            console.log("✓ Core systems initialized successfully");

            // 6. Start Render Loop
            sceneManager.startRenderLoop();
            
            // 7. Mount Initial Route (Home)
            navManager.navigateTo("Home");

        } catch (error) {
            console.error("❌ Fatal Error during AppManager bootstrap:", error);
        }
    }

    // Preserved dev overlay logic from old main.ts
    private _setupDevModeOverlay(): void {
        const gui = GUIManager.instance;
        const ui = gui.createFullscreenUI("DevOverlay");
        
        const panel = gui.createStackPanel("DevPanel", true);
        panel.verticalAlignment = 0;
        panel.horizontalAlignment = 0;
        panel.left = "20px";
        panel.top = "80px"; // Shifted down to accommodate HTML Nav bar
        ui.addControl(panel);
        
        const createText = (text: string) => {
            const label = gui.createLabel("", text);
            label.height = "25px";
            label.color = "yellow";
            label.textHorizontalAlignment = 0;
            panel.addControl(label);
            return label;
        };
        
        const fpsLabel = createText("FPS: 0");
        const meshLabel = createText("Meshes: 0");
        const camLabel = createText("Active Camera: None");
        const posLabel = createText("Pos: ");
        const tgtLabel = createText("Target: ");
        const assetLabel = createText("Assets: 0");
        const envLabel = createText("Env Loaded: No");
        const modelLabel = createText("Model Loaded: No");
        
        const scene = SceneManager.instance.scene;
        const engine = EngineManager.instance.engine;
        
        scene.onBeforeRenderObservable.add(() => {
            fpsLabel.text = `FPS: ${engine.getFps().toFixed(0)}`;
            
            const meshes = scene.meshes.length;
            meshLabel.text = `Meshes: ${meshes}`;
            
            if (meshes === 0) {
                meshLabel.text = "NO MESHES LOADED";
                meshLabel.color = "red";
            } else {
                meshLabel.color = "yellow";
            }
            
            const instrumentation = scene.getEngine().getLoadedTexturesCache().length;
            assetLabel.text = `Assets Cached: ${instrumentation}`;
            
            const cam = scene.activeCamera as any;
            if (cam) {
                camLabel.text = `Active Camera: ${cam.name}`;
                if (cam.position) {
                    posLabel.text = `Pos: ${cam.position.x.toFixed(1)}, ${cam.position.y.toFixed(1)}, ${cam.position.z.toFixed(1)}`;
                }
                if (cam.target) {
                    tgtLabel.text = `Target: ${cam.target.x.toFixed(1)}, ${cam.target.y.toFixed(1)}, ${cam.target.z.toFixed(1)}`;
                }
            }
            
            envLabel.text = `Env Loaded: ${scene.environmentTexture ? 'Yes' : 'No'}`;
            modelLabel.text = `Model Loaded: ${scene.meshes.some(m => m.name.includes("BoomBox") || m.name.includes("hero")) ? 'Yes' : 'No'}`;
        });
    }
}
