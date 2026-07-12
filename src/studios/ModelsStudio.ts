import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { EnvironmentManager } from "../core/environment/EnvironmentManager";
import { MaterialManager } from "../core/materials/MaterialManager";
import { AssetManager } from "../core/assets/AssetManager";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import gsap from "gsap";
import { Logger } from "../utilities/Logger";

const boomBoxUrl = "/assets/models/BoomBox.glb";
const envUrl = "/assets/hdr/environment.env";

import { IStudioPlugin } from "../core/plugins/IStudioPlugin";
import { Scene } from "@babylonjs/core/scene";

export class ModelsStudio implements IStudioPlugin {
    public name = "Models";
    private _scene: Scene | null = null;
    private _heroModel: AbstractMesh | null = null;
    
    public async install()
    {
        // Loading logic
    }

    public async activate(): Promise<void> {
        this._scene = SceneManager.instance.createScene();
        SceneManager.instance.setActiveScene(this._scene);
        
        this._setupCamera();
        const shadowGen = this._setupLighting();
        this._createFallbackScene();
        await this._setupEnvironment();
        
        const platform = this._createPlatform();
        if (shadowGen) shadowGen.addShadowCaster(platform);
        
        this._createMaterialSamples(shadowGen);
        await this._loadHeroModel(shadowGen);
        this._startAnimations();
    }
    
    public deactivate(): void {
        if (this._scene) {
            this._scene.dispose();
            this._scene = null;
        }
    }

    private _createFallbackScene(): void {
        const scene = SceneManager.instance.scene;
        const fallbackBox = MeshBuilder.CreateBox("fallbackBox", { size: 1 }, scene);
        fallbackBox.position.y = 0.5;
        fallbackBox.position.x = -2;
        
        const fallbackSphere = MeshBuilder.CreateSphere("fallbackSphere", { diameter: 1 }, scene);
        fallbackSphere.position.y = 0.5;
        fallbackSphere.position.x = 2;
    }

    private _setupCamera(): void {
        const camera = CameraManager.instance.createArcRotateCamera("ShowcaseCamera");
        camera.setPosition(new Vector3(0, 8, -20));
        camera.setTarget(new Vector3(0, 1.5, 0));
        camera.lowerRadiusLimit = 4;
        camera.upperRadiusLimit = 25;
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI / 2 - 0.05;
        camera.wheelPrecision = 50;
        camera.minZ = 0.1;
    }

    private _setupLighting(): any {
        const lm = LightingManager.instance;
        lm.createDirectionalLight("keyLight", new Vector3(-1, -2, -1), {
            intensity: 2.5,
            diffuse: new Color3(1, 0.98, 0.95),
            specular: new Color3(1, 1, 1),
            castShadows: true
        });
        lm.createDirectionalLight("fillLight", new Vector3(1, -0.5, 1), {
            intensity: 1.0,
            diffuse: new Color3(0.8, 0.85, 1.0),
            castShadows: false
        });
        lm.createDirectionalLight("rimLight", new Vector3(0, -1, 2), {
            intensity: 1.5,
            diffuse: new Color3(0.9, 0.9, 1.0),
            castShadows: false
        });

        const shadowGen = lm.getShadowGenerator("keyLight");
        if (shadowGen) {
            shadowGen.useBlurExponentialShadowMap = true;
            shadowGen.useKernelBlur = true;
            shadowGen.blurKernel = 64;
            shadowGen.bias = 0.002;
        }
        return shadowGen;
    }

    private async _setupEnvironment(): Promise<void> {
        const env = EnvironmentManager.instance;
        const mm = MaterialManager.instance;
        const scene = SceneManager.instance.scene;
        
        await env.setupHDR(envUrl, true);
        
        const floor = MeshBuilder.CreateGround("showroomFloor", { width: 100, height: 100 }, scene);
        const pbrFloor = mm.createChrome("floorMat"); 
        pbrFloor.albedoColor = new Color3(0.05, 0.05, 0.05);
        pbrFloor.metallic = 0.4;
        pbrFloor.roughness = 0.15;
        floor.material = pbrFloor;
        floor.receiveShadows = true;
    }

    private _createPlatform(): AbstractMesh {
        const scene = SceneManager.instance.scene;
        const mm = MaterialManager.instance;
        const platform = MeshBuilder.CreateCylinder("platform", { height: 0.2, diameter: 4, tessellation: 64 }, scene);
        platform.position.y = 0.1;
        const mat = mm.createPlastic("platformMat", new Color3(0.1, 0.1, 0.1));
        platform.material = mat;
        platform.receiveShadows = true;
        return platform;
    }

    private _createMaterialSamples(shadowGen: any): void {
        const scene = SceneManager.instance.scene;
        const mm = MaterialManager.instance;
        const materials = [
            mm.createGold("sampleGold"),
            mm.createChrome("sampleChrome"),
            mm.createGlass("sampleGlass"),
            mm.createPlastic("samplePlastic", new Color3(0.8, 0.1, 0.1)),
            mm.createRubber("sampleRubber"),
            mm.createConcrete("sampleConcrete"),
            mm.createWood("sampleWood"),
            mm.createEmissiveNeon("sampleNeon", new Color3(0, 0.8, 1))
        ];
        
        const radius = 6;
        const count = materials.length;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const ped = MeshBuilder.CreateCylinder(`ped_${i}`, { height: 1.5, diameter: 0.8, tessellation: 32 }, scene);
            ped.position = new Vector3(x, 0.75, z);
            ped.material = mm.createConcrete(`pedMat_${i}`);
            const sphere = MeshBuilder.CreateSphere(`sample_${i}`, { diameter: 1, segments: 64 }, scene);
            sphere.position = new Vector3(x, 2.0, z);
            sphere.material = materials[i];
            
            if (shadowGen) {
                shadowGen.addShadowCaster(ped);
                shadowGen.addShadowCaster(sphere);
            }
        }
    }

    private async _loadHeroModel(shadowGen: any): Promise<void> {
        const am = AssetManager.instance;
        try {
            const result = await am.loadModel("", boomBoxUrl, undefined);
            const rootMesh = result.rootNodes[0] as AbstractMesh;
            rootMesh.normalizeToUnitCube();
            const targetSize = 2.5;
            rootMesh.scaling.scaleInPlace(targetSize);
            const bounds = rootMesh.getHierarchyBoundingVectors();
            const lowestY = bounds.min.y;
            rootMesh.position.y -= lowestY - 0.2; 
            
            const meshes = rootMesh.getChildMeshes(false);
            meshes.forEach((m: any) => {
                if (shadowGen) shadowGen.addShadowCaster(m);
            });
            this._heroModel = rootMesh;
        } catch(e) {
            Logger.instance.error("Failed to load hero model", e);
            const scene = SceneManager.instance.scene;
            const fallbackHero = MeshBuilder.CreateSphere("fallbackHero", { diameter: 2 }, scene);
            fallbackHero.position.y = 1;
            if (shadowGen) shadowGen.addShadowCaster(fallbackHero);
            this._heroModel = fallbackHero;
        }
    }

    private _startAnimations(): void {
        const scene = SceneManager.instance.scene;
        const camera = CameraManager.instance.activeCamera as any;
        if (camera) {
            gsap.to(camera, {
                radius: 10,
                alpha: camera.alpha + Math.PI / 4,
                duration: 3.5,
                ease: "power2.inOut"
            });
        }
        
        scene.onBeforeRenderObservable.add(() => {
            if (this._heroModel) {
                const deltaTime = scene.getEngine().getDeltaTime();
                this._heroModel.rotation.y += 0.0002 * deltaTime;
            }
        });
    }
}



