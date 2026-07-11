import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { EnvironmentManager } from "../core/environment/EnvironmentManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { MaterialManager } from "../core/materials/MaterialManager";
import { AssetManager } from "../core/assets/AssetManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Logger } from "../utilities/Logger";

// Required to bundle static assets using Vite
// @ts-ignore: Vite URL import
import boomBoxUrl from "../assets/models/BoomBox.glb?url";

export class ShowcaseScene {
    /**
     * Orchestrates a polished, professional showroom environment.
     */
    public static async build(): Promise<void> {
        const sceneManager = SceneManager.instance;
        const cameraManager = CameraManager.instance;
        const envManager = EnvironmentManager.instance;
        const lightingManager = LightingManager.instance;
        const materialManager = MaterialManager.instance;
        const assetManager = AssetManager.instance;
        
        const scene = sceneManager.scene;

        // 1. Refined Camera Composition
        // Closer focal distance with tailored angles for a premium showcase look.
        const camera = cameraManager.createArcRotateCamera("ShowcaseCamera");
        camera.setPosition(new Vector3(0, 1.5, -4.5));
        camera.setTarget(new Vector3(0, 0.5, 0));
        camera.minZ = 0.05;
        camera.wheelPrecision = 80;
        camera.lowerRadiusLimit = 2.0;

        // 2. Cinematography / Lighting Balance
        // Lower ambient, highly directional primary light for dramatic shadows.
        lightingManager.createHemisphericLight("ambientLight", new Vector3(0, 1, 0), {
            intensity: 0.6,
            diffuse: new Color3(1, 1, 1)
        });

        const sunDir = new Vector3(-0.5, -1, -0.5);
        lightingManager.createDirectionalLight("sunLight", sunDir, {
            intensity: 3.5, 
            diffuse: new Color3(1, 0.98, 0.9),
            castShadows: true
        });

        // 3. Environment & HDR Processing
        const hdrUrl = "https://playground.babylonjs.com/textures/environment.env";
        await envManager.setupHDR(hdrUrl, true);
        
        // Ground configuration for physical shadow receiving
        const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
        ground.material = materialManager.createGround("pbrGround");
        ground.receiveShadows = true;

        const shadowGen = lightingManager.getShadowGenerator("sunLight");

        // 4. Asynchronous Model Loading with Progress Feedback
        try {
            Logger.instance.info("Commencing GLB Asset Download...");
            
            const modelResult = await assetManager.loadModel("", boomBoxUrl, (evt) => {
                if (evt.lengthComputable) {
                    const percentage = (evt.loaded * 100 / evt.total).toFixed(1);
                    Logger.instance.debug(`Downloading GLB... ${percentage}%`);
                } else {
                    Logger.instance.debug(`Downloading GLB... ${(evt.loaded / (1024 * 1024)).toFixed(2)} MB`);
                }
            });
            
            // Extract and position the root mesh of the model
            const rootMesh = modelResult.meshes[0];
            
            // Normalize scale and position for the showroom
            rootMesh.scaling = new Vector3(80, 80, 80); 
            rootMesh.position = new Vector3(0, 0, 0);
            
            // Register all descendant meshes into the shadow mapping pipeline
            if (shadowGen) {
                modelResult.meshes.forEach(m => shadowGen.addShadowCaster(m));
            }
            
            Logger.instance.info("High-Quality Asset Integrated Successfully.");
        } catch (error) {
            Logger.instance.error("Fatal Error Loading GLB Asset", error);
        }

        // 5. Append Contextual Material References
        this._buildReferencePedestals(shadowGen);
    }

    /**
     * Constructs scale-appropriate reference objects around the primary asset
     * for material and shadow comparisons.
     */
    private static _buildReferencePedestals(shadowGen: any): void {
        const scene = SceneManager.instance.scene;
        const mm = MaterialManager.instance;
        
        const referenceMaterials = [
            { id: "Gold", mat: mm.createGold("refGold") },
            { id: "Glass", mat: mm.createGlass("refGlass") },
            { id: "Neon", mat: mm.createEmissiveNeon("refNeon", new Color3(1, 0, 0.3)) }
        ];

        referenceMaterials.forEach((m, index) => {
            // Offset horizontally across the X axis
            const xPos = -2.5 + (index * 2.5);
            const zPos = 1.5; // Situate slightly behind the main object
            
            // Instantiate presentation pedestal
            const pedestal = MeshBuilder.CreateCylinder(`pedestal_${m.id}`, { height: 0.1, diameter: 0.8 }, scene);
            pedestal.position = new Vector3(xPos, 0.05, zPos);
            pedestal.material = mm.createConcrete(`concrete_${m.id}`);
            
            // Instantiate reference artifact
            const item = MeshBuilder.CreateSphere(`item_${m.id}`, { diameter: 0.6, segments: 64 }, scene);
            item.position = new Vector3(xPos, 0.4, zPos);
            item.material = m.mat;
            
            // Attach shadows
            if (shadowGen) {
                shadowGen.addShadowCaster(pedestal);
                shadowGen.addShadowCaster(item);
            }
        });
    }
}
