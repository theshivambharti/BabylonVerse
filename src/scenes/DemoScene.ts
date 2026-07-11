import { EnvironmentManager } from "../core/environment/EnvironmentManager";
import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { MaterialManager } from "../core/materials/MaterialManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { DemoObjects } from "./DemoObjects";

export class DemoScene {
    /**
     * Bootstraps the visual foundation utilizing pre-existing managers.
     */
    public static async build(): Promise<void> {
        const sceneManager = SceneManager.instance;
        const cameraManager = CameraManager.instance;
        const envManager = EnvironmentManager.instance;
        const lightingManager = LightingManager.instance;
        const materialManager = MaterialManager.instance;
        
        const scene = sceneManager.scene;

        // 1. Camera Configuration (Adjusted for gallery view)
        const camera = cameraManager.createArcRotateCamera("DemoCamera");
        camera.setPosition(new Vector3(0, 10, -20));
        camera.setTarget(new Vector3(0, 0, 5));

        // 2. Lighting (Hemispheric + Directional for Soft Shadows)
        lightingManager.createHemisphericLight("ambientLight", new Vector3(0, 1, 0), {
            intensity: 0.4,
            diffuse: new Color3(1, 1, 1)
        });

        const sunDir = new Vector3(-1, -2, -1);
        lightingManager.createDirectionalLight("sunLight", sunDir, {
            intensity: 2.0,
            diffuse: new Color3(1, 0.98, 0.9),
            specular: new Color3(1, 1, 1),
            castShadows: true
        });

        // 3. Environment & Skybox (Loaded from BabylonJS public playground assets)
        const hdrUrl = "https://playground.babylonjs.com/textures/environment.env";
        await envManager.setupHDR(hdrUrl, true);

        // 4. Ground
        const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
        ground.material = materialManager.createGround("pbrGround");
        ground.receiveShadows = true;

        // 5. Grid Overlay
        const grid = MeshBuilder.CreateGround("grid", { width: 50, height: 50 }, scene);
        grid.position.y = 0.01; // Avoid Z-fighting with ground
        const gridMat = new GridMaterial("gridMat", scene);
        gridMat.mainColor = new Color3(0.5, 0.5, 0.5);
        gridMat.lineColor = new Color3(1, 1, 1);
        gridMat.opacity = 0.2;
        gridMat.gridRatio = 1;
        gridMat.majorUnitFrequency = 5;
        grid.material = gridMat;
        grid.receiveShadows = false;
        grid.isPickable = false;

        // 6. Axes Helper
        new AxesViewer(scene, 3);
        
        // 7. Render Gallery Objects via MaterialManager showcasing
        DemoObjects.createShowcase();
    }
}
