import { IShowcase } from "../core/interfaces/IShowcase";
import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { EnvironmentManager } from "../core/environment/EnvironmentManager";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import { BoundingBoxGizmo } from "@babylonjs/core/Gizmos/boundingBoxGizmo";
import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import gsap from "gsap";

export class CamerasShowcase implements IShowcase {
    private _scene: Scene | null = null;
    private _uiContainer: HTMLElement | null = null;
    private _utilLayer: UtilityLayerRenderer | null = null;
    private _bbGizmo: BoundingBoxGizmo | null = null;
    private _tourActive: boolean = false;
    private _tourTimeline: gsap.core.Timeline | null = null;
    private _meshes: AbstractMesh[] = [];

    public async load(): Promise<void> {
        this._scene = SceneManager.instance.createScene();
        SceneManager.instance.setActiveScene(this._scene);

        // Load studio environment
        await EnvironmentManager.instance.setupHDR("https://playground.babylonjs.com/textures/environment.env");
        this._scene.environmentIntensity = 1.2;

        LightingManager.instance.createDirectionalLight("dirLight", new Vector3(-1, -2, -1), {
            intensity: 1.5,
            diffuse: new Color3(1, 0.95, 0.9)
        });

        // Initialize default camera
        const camera = CameraManager.instance.createArcRotateCamera("ArcRotateCamera");
        camera.setPosition(new Vector3(0, 5, -15));

        // Setup Gizmos
        this._utilLayer = new UtilityLayerRenderer(this._scene);
        this._bbGizmo = new BoundingBoxGizmo(Color3.FromHexString("#00d2ff"), this._utilLayer);
        
        this._buildScene();
        this._buildUI();
        this._setupInteractions();
    }

    public unload(): void {
        window.removeEventListener("keydown", this._handleKey);
        this._tourActive = false;
        if (this._tourTimeline) {
            this._tourTimeline.kill();
        }
        if (this._bbGizmo) {
            this._bbGizmo.dispose();
            this._bbGizmo = null;
        }
        if (this._utilLayer) {
            this._utilLayer.dispose();
            this._utilLayer = null;
        }
        if (this._uiContainer) {
            this._uiContainer.remove();
            this._uiContainer = null;
        }
        if (this._scene) {
            this._scene.dispose();
            this._scene = null;
        }
    }

    private _buildScene(): void {
        if (!this._scene) return;

        // Ground
        const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, this._scene);
        const groundMat = new PBRMaterial("groundMat", this._scene);
        groundMat.albedoColor = new Color3(0.1, 0.1, 0.1);
        groundMat.metallic = 0.5;
        groundMat.roughness = 0.4;
        ground.material = groundMat;
        ground.receiveShadows = true;

        // Objects
        const createPBR = (name: string, color: Color3, metallic: number, roughness: number) => {
            const mat = new PBRMaterial(name, this._scene!);
            mat.albedoColor = color;
            mat.metallic = metallic;
            mat.roughness = roughness;
            return mat;
        };

        const sphere = MeshBuilder.CreateSphere("sphere", { segments: 32, diameter: 2 }, this._scene);
        sphere.position = new Vector3(-3, 1, 0);
        sphere.material = createPBR("sphereMat", new Color3(1, 0.2, 0.2), 0.1, 0.2);

        const box = MeshBuilder.CreateBox("box", { size: 2 }, this._scene);
        box.position = new Vector3(3, 1, 0);
        box.material = createPBR("boxMat", new Color3(0.2, 0.8, 0.2), 0.8, 0.2);

        const torus = MeshBuilder.CreateTorus("torus", { diameter: 2, thickness: 0.5, tessellation: 64 }, this._scene);
        torus.position = new Vector3(0, 1, 3);
        torus.material = createPBR("torusMat", new Color3(0.2, 0.5, 1), 1.0, 0.1);
        
        const cyl = MeshBuilder.CreateCylinder("cylinder", { height: 2, diameter: 2 }, this._scene);
        cyl.position = new Vector3(0, 1, -3);
        cyl.material = createPBR("cylMat", new Color3(1, 0.8, 0), 0.0, 0.8);

        this._meshes = [sphere, box, torus, cyl];
        
        // Add moving object for FollowCamera to track
        const drone = MeshBuilder.CreateSphere("drone", { diameter: 0.5 }, this._scene);
        drone.position = new Vector3(0, 4, 0);
        const droneMat = new StandardMaterial("droneMat", this._scene);
        droneMat.emissiveColor = Color3.Green();
        drone.material = droneMat;
        
        this._scene.onBeforeRenderObservable.add(() => {
            const time = performance.now() * 0.001;
            drone.position.x = Math.sin(time) * 10;
            drone.position.z = Math.cos(time) * 10;
            drone.position.y = 4 + Math.sin(time * 2);
            torus.rotation.x += 0.01;
            torus.rotation.y += 0.02;
            box.rotation.y -= 0.01;
        });

        this._meshes.push(drone);
    }

    private _buildUI(): void {
        const uiLayer = document.getElementById("ui-layer");
        if (!uiLayer) return;

        this._uiContainer = document.createElement("div");
        this._uiContainer.className = "camera-panel show";
        
        this._uiContainer.innerHTML = `
            <div class="panel-header">
                <h2>Camera Studio</h2>
                <div class="status-indicator"></div>
            </div>

            <div class="camera-controls">
                <div class="control-group">
                    <label>Camera Type</label>
                    <select id="cam-type" class="custom-select">
                        <option value="arc">ArcRotate Camera</option>
                        <option value="univ">Universal Camera</option>
                        <option value="free">Free Camera</option>
                        <option value="follow">Follow Camera</option>
                        <option value="fly">Fly Camera</option>
                        <option value="device">Device Orientation</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Field of View (FOV): <span id="fov-val">0.8</span></label>
                    <input type="range" id="cam-fov" min="0.1" max="2.0" step="0.1" value="0.8">
                </div>
                
                <div class="control-group">
                    <label>Speed: <span id="speed-val">0.5</span></label>
                    <input type="range" id="cam-speed" min="0.1" max="5.0" step="0.1" value="0.5">
                </div>
                
                <div class="control-group">
                    <label>Inertia: <span id="inertia-val">0.9</span></label>
                    <input type="range" id="cam-inertia" min="0.0" max="0.99" step="0.01" value="0.9">
                </div>
            </div>

            <div class="camera-actions">
                <button class="btn" id="btn-focus">Focus (F)</button>
                <button class="btn" id="btn-reset">Reset (R)</button>
                <button class="btn" id="btn-tour">Cinematic Tour</button>
            </div>
            
            <div style="font-size: 0.8rem; color: #888; margin-top: 10px;">
                Shortcuts: 1-6 Switch | Click Object to Pick | Space = AutoRotate (Arc)
            </div>
        `;

        uiLayer.appendChild(this._uiContainer);

        // Bind Events
        const typeSel = document.getElementById("cam-type") as HTMLSelectElement;
        const fovSlider = document.getElementById("cam-fov") as HTMLInputElement;
        const speedSlider = document.getElementById("cam-speed") as HTMLInputElement;
        const inertiaSlider = document.getElementById("cam-inertia") as HTMLInputElement;
        
        typeSel.addEventListener("change", (e) => this._switchCamera((e.target as HTMLSelectElement).value));
        
        fovSlider.addEventListener("input", (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            document.getElementById("fov-val")!.innerText = val.toFixed(1);
            if (CameraManager.instance.activeCamera) {
                CameraManager.instance.activeCamera.fov = val;
            }
        });

        speedSlider.addEventListener("input", (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            document.getElementById("speed-val")!.innerText = val.toFixed(1);
            const cam = CameraManager.instance.activeCamera as any;
            if (cam.speed !== undefined) cam.speed = val;
        });

        inertiaSlider.addEventListener("input", (e) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            document.getElementById("inertia-val")!.innerText = val.toFixed(2);
            if (CameraManager.instance.activeCamera) {
                CameraManager.instance.activeCamera.inertia = val;
            }
        });

        document.getElementById("btn-focus")?.addEventListener("click", () => this._focusSelected());
        document.getElementById("btn-reset")?.addEventListener("click", () => CameraManager.instance.reset());
        document.getElementById("btn-tour")?.addEventListener("click", () => this._toggleTour());
    }

    private _switchCamera(type: string): void {
        const cm = CameraManager.instance;
        let drone = this._meshes.find(m => m.name === "drone");

        switch (type) {
            case "arc":
                cm.createArcRotateCamera("ArcRotateCamera");
                break;
            case "univ":
                cm.createUniversalCamera("UniversalCamera");
                break;
            case "free":
                cm.createFreeCamera("FreeCamera");
                break;
            case "follow":
                cm.createFollowCamera("FollowCamera", drone);
                break;
            case "fly":
                cm.createFlyCamera("FlyCamera");
                break;
            case "device":
                cm.createDeviceOrientationCamera("DeviceOrientationCamera");
                break;
        }

        // Restore active values
        const fov = parseFloat((document.getElementById("cam-fov") as HTMLInputElement).value);
        const speed = parseFloat((document.getElementById("cam-speed") as HTMLInputElement).value);
        const inertia = parseFloat((document.getElementById("cam-inertia") as HTMLInputElement).value);
        
        if (cm.activeCamera) {
            cm.activeCamera.fov = fov;
            cm.activeCamera.inertia = inertia;
            const cam = cm.activeCamera as any;
            if (cam.speed !== undefined) cam.speed = speed;
        }
    }

    private _setupInteractions(): void {
        if (!this._scene) return;

        // Picking
        this._scene.onPointerDown = (_evt, pickResult) => {
            if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.name !== "ground") {
                if (this._bbGizmo) {
                    this._bbGizmo.attachedMesh = pickResult.pickedMesh;
                }
            } else if (pickResult.hit && pickResult.pickedMesh?.name === "ground") {
                if (this._bbGizmo) this._bbGizmo.attachedMesh = null;
            }
        };

        // Keyboard
        window.addEventListener("keydown", this._handleKey);
    }

    private _handleKey = (e: KeyboardEvent) => {
        if (!this._scene) return;
        
        const sel = document.getElementById("cam-type") as HTMLSelectElement;
        
        switch (e.key.toLowerCase()) {
            case "f":
                this._focusSelected();
                break;
            case "r":
                CameraManager.instance.reset();
                break;
            case " ":
                if (CameraManager.instance.activeCamera instanceof ArcRotateCamera) {
                    const arc = CameraManager.instance.activeCamera as ArcRotateCamera;
                    arc.useAutoRotationBehavior = !arc.useAutoRotationBehavior;
                }
                break;
            case "1": sel.value = "arc"; this._switchCamera("arc"); break;
            case "2": sel.value = "univ"; this._switchCamera("univ"); break;
            case "3": sel.value = "free"; this._switchCamera("free"); break;
            case "4": sel.value = "follow"; this._switchCamera("follow"); break;
            case "5": sel.value = "fly"; this._switchCamera("fly"); break;
            case "6": sel.value = "device"; this._switchCamera("device"); break;
        }
    }

    private _focusSelected(): void {
        if (this._bbGizmo?.attachedMesh) {
            CameraManager.instance.focusOn(this._bbGizmo.attachedMesh);
        } else if (this._meshes.length > 0) {
            // Default to first mesh if none selected
            CameraManager.instance.focusOn(this._meshes[0]);
        }
    }

    private _toggleTour(): void {
        this._tourActive = !this._tourActive;
        const btn = document.getElementById("btn-tour");
        if (btn) btn.style.background = this._tourActive ? "rgba(0, 255, 128, 0.4)" : "";

        if (!this._tourActive) {
            if (this._tourTimeline) this._tourTimeline.kill();
            CameraManager.instance.reset();
            return;
        }

        const sel = document.getElementById("cam-type") as HTMLSelectElement;
        
        // Simple cinematic tour: Switch to ArcRotate and visit objects
        sel.value = "arc";
        this._switchCamera("arc");
        
        this._tourTimeline = gsap.timeline({ repeat: -1 });
        
        // Ensure ArcRotate for tour
        const arc = CameraManager.instance.activeCamera as ArcRotateCamera;
        
        this._meshes.slice(0, 4).forEach((mesh, index) => {
            const center = mesh.getBoundingInfo().boundingSphere.centerWorld;
            this._tourTimeline!.to(arc.target, {
                x: center.x, y: center.y, z: center.z,
                duration: 2, ease: "power2.inOut"
            })
            .to(arc, {
                radius: 4, alpha: Math.PI / 4 + (index * Math.PI / 2),
                duration: 2, ease: "power2.inOut"
            }, "<")
            .to({}, { duration: 1 }); // wait
        });
    }


}
