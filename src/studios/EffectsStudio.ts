import { IStudioPlugin } from "../core/plugins/IStudioPlugin";
import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

export class EffectsStudio implements IStudioPlugin {
    public name = "Effects";
    private _scene: Scene | null = null;
    private _uiContainer: HTMLElement | null = null;

    public async install()
    {
        // Loading logic
    }

    public async activate(): Promise<void> {
        // 1. Create dedicated scene
        this._scene = SceneManager.instance.createScene();
        SceneManager.instance.setActiveScene(this._scene);

        // 2. Setup Camera and Lighting
        const camera = CameraManager.instance.createArcRotateCamera("EffectsCamera");
        camera.setPosition(new Vector3(0, 5, -10));
        
        LightingManager.instance.createDirectionalLight("dirLight", new Vector3(-1, -2, -1), {
            intensity: 1.0,
            diffuse: new Color3(1, 1, 1)
        });

        // 3. Optional: Add a spinning cube just to show 3D works
        const box = MeshBuilder.CreateBox("box", { size: 2 }, this._scene);
        box.position.y = 1;
        this._scene.onBeforeRenderObservable.add(() => {
            box.rotation.y += 0.01;
            box.rotation.x += 0.005;
        });

        // 4. Build UI
        this._buildUI();
    }

    public deactivate(): void {
        if (this._uiContainer) {
            this._uiContainer.remove();
            this._uiContainer = null;
        }
        if (this._scene) {
            this._scene.dispose();
            this._scene = null;
        }
    }

    private _buildUI(): void {
        const uiLayer = document.getElementById("ui-layer");
        if (!uiLayer) return;

        this._uiContainer = document.createElement("div");
        this._uiContainer.style.position = "absolute";
        this._uiContainer.style.top = "50%";
        this._uiContainer.style.left = "50%";
        this._uiContainer.style.transform = "translate(-50%, -50%)";
        this._uiContainer.style.textAlign = "center";
        this._uiContainer.style.color = "white";
        this._uiContainer.style.fontFamily = "sans-serif";
        this._uiContainer.style.background = "rgba(20, 20, 20, 0.8)";
        this._uiContainer.style.padding = "40px";
        this._uiContainer.style.borderRadius = "12px";
        this._uiContainer.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        this._uiContainer.style.backdropFilter = "blur(10px)";

        const title = document.createElement("h1");
        title.textContent = "Effects Showcase";
        title.style.margin = "0 0 10px 0";

        const desc = document.createElement("p");
        desc.textContent = "Explore advanced effects features and capabilities.";
        desc.style.margin = "0 0 20px 0";
        desc.style.color = "#ccc";

        const status = document.createElement("div");
        status.textContent = "Ready for implementation";
        status.style.background = "rgba(0, 255, 128, 0.2)";
        status.style.color = "#00ff80";
        status.style.padding = "10px 20px";
        status.style.borderRadius = "20px";
        status.style.display = "inline-block";
        status.style.fontWeight = "bold";

        this._uiContainer.appendChild(title);
        this._uiContainer.appendChild(desc);
        this._uiContainer.appendChild(status);

        uiLayer.appendChild(this._uiContainer);
    }
}



