import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { SceneManager } from "../scene/SceneManager";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export class MaterialManager {
    private static _instance: MaterialManager;

    private constructor() {}

    public static initialize(): MaterialManager {
        if (!MaterialManager._instance) {
            MaterialManager._instance = new MaterialManager();
        }
        return MaterialManager._instance;
    }

    public static get instance(): MaterialManager {
        if (!MaterialManager._instance) {
            throw new Error("MaterialManager has not been initialized. Call initialize() first.");
        }
        return MaterialManager._instance;
    }

    public createGold(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = Color3.FromHexString("#FFD700");
        pbr.metallic = 1.0;
        pbr.roughness = 0.15;
        return pbr;
    }

    public createChrome(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.9, 0.9, 0.9);
        pbr.metallic = 1.0;
        pbr.roughness = 0.0;
        return pbr;
    }

    public createGlass(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.9, 0.9, 0.9);
        pbr.metallic = 0.0;
        pbr.roughness = 0.0;
        pbr.alpha = 0.3;
        pbr.indexOfRefraction = 1.5;
        pbr.subSurface.isRefractionEnabled = true;
        pbr.subSurface.refractionIntensity = 1.0;
        return pbr;
    }

    public createPlastic(name: string, color: Color3 = new Color3(0.1, 0.5, 0.8)): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = color;
        pbr.metallic = 0.0;
        pbr.roughness = 0.25;
        return pbr;
    }

    public createRubber(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.1, 0.1, 0.1);
        pbr.metallic = 0.0;
        pbr.roughness = 0.9;
        return pbr;
    }

    public createConcrete(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.6, 0.6, 0.6);
        pbr.metallic = 0.0;
        pbr.roughness = 0.8;
        return pbr;
    }

    public createWood(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.4, 0.25, 0.1);
        pbr.metallic = 0.0;
        pbr.roughness = 0.6;
        return pbr;
    }

    public createGround(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.15, 0.15, 0.15);
        pbr.metallic = 0.05;
        pbr.roughness = 0.85;
        return pbr;
    }

    public createEmissiveNeon(name: string, color: Color3 = new Color3(0, 1, 0)): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0, 0, 0);
        pbr.emissiveColor = color;
        pbr.emissiveIntensity = 2.0;
        pbr.metallic = 0.0;
        pbr.roughness = 0.4;
        return pbr;
    }

    public createCopper(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = Color3.FromHexString("#B87333");
        pbr.metallic = 1.0;
        pbr.roughness = 0.2;
        return pbr;
    }

    public createMarble(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.95, 0.95, 0.92);
        pbr.metallic = 0.0;
        pbr.roughness = 0.1;
        pbr.subSurface.isRefractionEnabled = true;
        pbr.subSurface.refractionIntensity = 0.2;
        return pbr;
    }

    public createFabric(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.8, 0.3, 0.3); // Deep red fabric
        pbr.metallic = 0.0;
        pbr.roughness = 0.95;
        // Simulating velvet/fabric sheen via clearcoat/sheen if possible
        pbr.sheen.isEnabled = true;
        pbr.sheen.intensity = 0.8;
        return pbr;
    }

    public createCarbonFiber(name: string): PBRMaterial {
        const pbr = new PBRMaterial(name, SceneManager.instance.scene);
        pbr.albedoColor = new Color3(0.1, 0.1, 0.1);
        pbr.metallic = 0.3;
        pbr.roughness = 0.4;
        pbr.clearCoat.isEnabled = true;
        pbr.clearCoat.intensity = 1.0;
        pbr.clearCoat.roughness = 0.1;
        return pbr;
    }
}
