import { SceneManager } from "../scene/SceneManager";
import { AssetManager } from "../assets/AssetManager";
import { ConfigManager } from "../config/ConfigManager";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Logger } from "../../utilities/Logger";

export enum FogMode {
    NONE = Scene.FOGMODE_NONE,
    EXP = Scene.FOGMODE_EXP,
    EXP2 = Scene.FOGMODE_EXP2,
    LINEAR = Scene.FOGMODE_LINEAR
}

export class EnvironmentManager {
    private static _instance: EnvironmentManager;

    private constructor() {}

    public static initialize(): EnvironmentManager {
        if (!EnvironmentManager._instance) {
            EnvironmentManager._instance = new EnvironmentManager();
        }
        return EnvironmentManager._instance;
    }

    public static get instance(): EnvironmentManager {
        if (!EnvironmentManager._instance) {
            throw new Error("EnvironmentManager has not been initialized. Call initialize() first.");
        }
        return EnvironmentManager._instance;
    }

    private _currentSkybox: import("@babylonjs/core/Meshes/mesh").Mesh | null = null;

    /**
     * Loads an HDR or ENV texture using the AssetManager and sets it up as the 
     * environment reflection map. Optionally creates a skybox.
     */
    public async setupHDR(url: string, createSkybox: boolean = true): Promise<void> {
        const scene = SceneManager.instance.scene;
        const config = ConfigManager.instance.hdrSettings;
        
        try {
            // Load via AssetManager to guarantee caching
            const texture = await AssetManager.instance.loadHDR(url);
            
            // Apply environment for PBR material reflections globally
            scene.environmentTexture = texture;
            scene.environmentIntensity = config.environmentIntensity;

            if (createSkybox) {
                // Remove old skybox if it exists
                if (this._currentSkybox) {
                    this._currentSkybox.dispose();
                }
                // Generate a skybox from the loaded HDR map with 0 blur for crisp background
                const skybox = scene.createDefaultSkybox(texture, true, config.skyboxSize, 0);
                if (skybox) {
                    skybox.name = "EnvironmentSkybox";
                    skybox.isPickable = false;
                    this._currentSkybox = skybox as import("@babylonjs/core/Meshes/mesh").Mesh;
                }
            }
            
            Logger.instance.debug(`HDR Environment and Reflections loaded from: ${url}`);
        } catch (error) {
            Logger.instance.error(`Failed to setup HDR from ${url}:`, error);
            scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
        }
    }

    /**
     * Creates a simple physical ground plane that receives shadows.
     */
    public createGround(size: number = 100, textureUrl?: string): void {
        const scene = SceneManager.instance.scene;
        const ground = MeshBuilder.CreateGround("EnvironmentGround", { width: size, height: size }, scene);
        
        // Critical for realism
        ground.receiveShadows = true;

        if (textureUrl) {
            const material = new StandardMaterial("EnvironmentGroundMaterial", scene);
            // Async texture load without blocking main thread
            AssetManager.instance.loadTexture(textureUrl).then((texture) => {
                material.diffuseTexture = texture;
                // Tile the texture to avoid stretching
                texture.uScale = size / 10;
                texture.vScale = size / 10;
            }).catch(err => {
                Logger.instance.error(`Failed to load ground texture:`, err);
            });
            
            material.specularColor = new Color3(0.05, 0.05, 0.05); // Reduce plastic-like shine
            ground.material = material;
        } else {
            // Default dark gray material if no texture
            const material = new StandardMaterial("EnvironmentGroundDefaultMaterial", scene);
            material.diffuseColor = new Color3(0.2, 0.2, 0.2);
            material.specularColor = new Color3(0.05, 0.05, 0.05);
            ground.material = material;
        }
    }

    /**
     * Configures atmospheric fog.
     */
    public setupFog(
        mode: FogMode, 
        color: Color3 = new Color3(0.8, 0.8, 0.8), 
        density: number = 0.01, 
        start: number = 10, 
        end: number = 100
    ): void {
        const scene = SceneManager.instance.scene;
        scene.fogMode = mode as number;
        scene.fogColor = color;
        
        if (mode === FogMode.EXP || mode === FogMode.EXP2) {
            scene.fogDensity = density;
        } else if (mode === FogMode.LINEAR) {
            scene.fogStart = start;
            scene.fogEnd = end;
        }
        
        Logger.instance.debug(`Atmospheric fog enabled. Mode: ${mode}`);
    }
}
