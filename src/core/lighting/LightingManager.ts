import { SceneManager } from "../scene/SceneManager";
import { ConfigManager } from "../config/ConfigManager";
import { Light } from "@babylonjs/core/Lights/light";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { IShadowLight } from "@babylonjs/core/Lights/shadowLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export interface LightConfig {
    intensity?: number;
    diffuse?: Color3;
    specular?: Color3;
    castShadows?: boolean;
}

export class LightingManager {
    private static _instance: LightingManager;
    private _shadowGenerators: Map<string, ShadowGenerator> = new Map();

    private constructor() {}

    public static initialize(): LightingManager {
        if (!LightingManager._instance) {
            LightingManager._instance = new LightingManager();
        }
        return LightingManager._instance;
    }

    public static get instance(): LightingManager {
        if (!LightingManager._instance) {
            throw new Error("LightingManager has not been initialized. Call initialize() first.");
        }
        return LightingManager._instance;
    }

    /**
     * Creates an ambient hemispheric light.
     */
    public createHemisphericLight(name: string, direction: Vector3, config?: LightConfig): HemisphericLight {
        const scene = SceneManager.instance.scene;
        const light = new HemisphericLight(name, direction, scene);
        this._applyConfig(light, config);
        return light;
    }

    /**
     * Creates a directional light, typically used for sun/moon.
     */
    public createDirectionalLight(name: string, direction: Vector3, config?: LightConfig): DirectionalLight {
        const scene = SceneManager.instance.scene;
        const light = new DirectionalLight(name, direction, scene);
        
        this._applyConfig(light, config);
        
        if (config?.castShadows) {
            this.addShadowGenerator(light);
        }
        
        return light;
    }

    /**
     * Creates a spot light.
     */
    public createSpotLight(name: string, position: Vector3, direction: Vector3, angle: number, exponent: number, config?: LightConfig): SpotLight {
        const scene = SceneManager.instance.scene;
        const light = new SpotLight(name, position, direction, angle, exponent, scene);
        
        this._applyConfig(light, config);
        
        if (config?.castShadows) {
            this.addShadowGenerator(light);
        }
        
        return light;
    }

    /**
     * Creates a point light, typically used for local illumination.
     */
    public createPointLight(name: string, position: Vector3, config?: LightConfig): PointLight {
        const scene = SceneManager.instance.scene;
        const light = new PointLight(name, position, scene);
        
        this._applyConfig(light, config);
        
        if (config?.castShadows) {
            this.addShadowGenerator(light);
        }
        
        return light;
    }

    /**
     * Bootstraps a production-ready ShadowGenerator for a given shadow-casting light.
     */
    public addShadowGenerator(light: IShadowLight): ShadowGenerator {
        if (this._shadowGenerators.has(light.name)) {
            return this._shadowGenerators.get(light.name)!;
        }

        const shadowMapSize = ConfigManager.instance.shadowQuality === "high" ? 2048 : (ConfigManager.instance.shadowQuality === "medium" ? 1024 : 512);
        const shadowGenerator = new ShadowGenerator(shadowMapSize, light);
        
        // Professional shadow defaults for smooth, high-quality filtering
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;
        shadowGenerator.setDarkness(0.2); 

        this._shadowGenerators.set(light.name, shadowGenerator);
        
        return shadowGenerator;
    }

    /**
     * Retrieves a created ShadowGenerator by light name.
     */
    public getShadowGenerator(lightName: string): ShadowGenerator | undefined {
        return this._shadowGenerators.get(lightName);
    }

    private _applyConfig(light: Light, config?: LightConfig): void {
        if (!config) return;
        
        if (config.intensity !== undefined) {
            light.intensity = config.intensity;
        }
        if (config.diffuse !== undefined) {
            light.diffuse = config.diffuse;
        }
        if (config.specular !== undefined) {
            light.specular = config.specular;
        }
    }

    public setLightColor(light: Light, hex: string): void {
        light.diffuse = Color3.FromHexString(hex);
    }

    public removeShadowGenerator(light: IShadowLight): void {
        if (this._shadowGenerators.has(light.name)) {
            const sg = this._shadowGenerators.get(light.name);
            sg?.dispose();
            this._shadowGenerators.delete(light.name);
        }
    }

    /**
     * Clears all cached shadow generators when a scene is disposed.
     */
    public clearSceneContext(): void {
        this._shadowGenerators.forEach((sg) => {
            sg.dispose();
        });
        this._shadowGenerators.clear();
    }

    public toggleShadows(light: IShadowLight, enabled: boolean, meshes?: import("@babylonjs/core/Meshes/abstractMesh").AbstractMesh[]): void {
        if (enabled) {
            const sg = this.addShadowGenerator(light);
            if (meshes) {
                meshes.forEach(m => sg.addShadowCaster(m));
            }
        } else {
            this.removeShadowGenerator(light);
        }
    }
}

