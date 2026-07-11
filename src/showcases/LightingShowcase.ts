import { IShowcase } from "../core/interfaces/IShowcase";
import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { MaterialManager } from "../core/materials/MaterialManager";
import { AssetManager } from "../core/assets/AssetManager";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { LightGizmo } from "@babylonjs/core/Gizmos/lightGizmo";
import { GizmoManager } from "@babylonjs/core/Gizmos/gizmoManager";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Light } from "@babylonjs/core/Lights/light";
import { IShadowLight } from "@babylonjs/core/Lights/shadowLight";
import gsap from "gsap";

const envStudio = "/assets/hdr/studio.env";

export class LightingShowcase implements IShowcase {
    private _scene: Scene | null = null;
    private _uiContainer: HTMLElement | null = null;
    private _meshes: AbstractMesh[] = [];
    
    private _lights: {
        hemi: HemisphericLight | null;
        dir: DirectionalLight | null;
        spot: SpotLight | null;
        point: PointLight | null;
    } = { hemi: null, dir: null, spot: null, point: null };

    private _gizmos: Map<string, LightGizmo> = new Map();
    private _utilityLayer: UtilityLayerRenderer | null = null;
    private _gizmoManager: GizmoManager | null = null;

    private _uiRefreshObserver: any = null;
    private _pointerObserver: any = null;

    public async load(): Promise<void> {
        this._scene = SceneManager.instance.createScene();
        SceneManager.instance.setActiveScene(this._scene);

        // Preload assets
        const hdrTexture = await AssetManager.instance.loadHDR(envStudio);
        this._scene.environmentTexture = hdrTexture;
        this._scene.environmentIntensity = 1.2;

        this._setupCamera();
        this._createEnvironment();
        this._createMeshes();
        this._createLights();
        this._createGizmos();
        this._buildUI();

        // Double click to reset camera
        this._pointerObserver = this._scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERDOUBLETAP) {
                this._resetCamera();
            }
        });
    }

    public unload(): void {
        if (this._uiRefreshObserver && this._scene) {
            this._scene.onBeforeRenderObservable.remove(this._uiRefreshObserver);
        }
        if (this._pointerObserver && this._scene) {
            this._scene.onPointerObservable.remove(this._pointerObserver);
        }
        if (this._uiContainer) {
            this._uiContainer.remove();
            this._uiContainer = null;
        }
        if (this._utilityLayer) {
            this._utilityLayer.dispose();
            this._utilityLayer = null;
        }
        if (this._gizmoManager) {
            this._gizmoManager.dispose();
            this._gizmoManager = null;
        }
        this._gizmos.forEach(g => g.dispose());
        this._gizmos.clear();

        if (this._scene) {
            this._scene.dispose();
            this._scene = null;
        }
    }

    private _setupCamera(): void {
        const camera = CameraManager.instance.createArcRotateCamera("LightingCamera");
        camera.alpha = Math.PI / 4;
        camera.beta = Math.PI / 3;
        camera.radius = 15;
        camera.setTarget(Vector3.Zero());
    }

    private _resetCamera(): void {
        const camera = CameraManager.instance.activeCamera as any;
        if (camera) {
            gsap.to(camera, {
                alpha: Math.PI / 4,
                beta: Math.PI / 3,
                radius: 15,
                duration: 1.5,
                ease: "power2.inOut"
            });
            gsap.to(camera.target, {
                x: 0, y: 0, z: 0,
                duration: 1.5,
                ease: "power2.inOut"
            });
        }
    }

    private _focusLight(light: Light): void {
        const camera = CameraManager.instance.activeCamera as any;
        if (!camera || !light) return;

        let targetPos = Vector3.Zero();
        if ((light as any).position) {
            targetPos = (light as any).position.clone();
        }

        gsap.to(camera.target, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 1.5,
            ease: "power3.inOut"
        });
        gsap.to(camera, {
            radius: 12,
            duration: 1.5,
            ease: "power3.inOut"
        });
    }

    private _createEnvironment(): void {
        if (!this._scene) return;
        // hdrTexture is already set during load()

        const marbleMaterial = MaterialManager.instance.createMarble("marbleMat");
        const floor = MeshBuilder.CreateGround("floor", { width: 30, height: 30 }, this._scene);
        floor.material = marbleMaterial;
        floor.receiveShadows = true;
        this._meshes.push(floor);
    }

    private _createMeshes(): void {
        if (!this._scene) return;
        const mat = MaterialManager.instance.createPlastic("baseMat", new Color3(0.8, 0.8, 0.8));

        const positions = [
            new Vector3(0, 1.5, 0),    // Center TorusKnot
            new Vector3(-6, 1, -6),    // Sphere
            new Vector3(6, 1, -6),     // Box
            new Vector3(-6, 1, 6),     // Cylinder
            new Vector3(6, 1, 6)       // Torus
        ];

        const tk = MeshBuilder.CreateTorusKnot("tk", { radius: 1, tube: 0.3, radialSegments: 64, tubularSegments: 32 }, this._scene);
        tk.position = positions[0];
        
        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this._scene);
        sphere.position = positions[1];

        const box = MeshBuilder.CreateBox("box", { size: 2 }, this._scene);
        box.position = positions[2];

        const cyl = MeshBuilder.CreateCylinder("cyl", { diameter: 2, height: 2 }, this._scene);
        cyl.position = positions[3];

        const torus = MeshBuilder.CreateTorus("torus", { diameter: 2, thickness: 0.5 }, this._scene);
        torus.position = positions[4];

        [tk, sphere, box, cyl, torus].forEach(m => {
            m.material = mat;
            m.receiveShadows = true;
            this._meshes.push(m);
        });
    }

    private _createLights(): void {
        this._lights.hemi = LightingManager.instance.createHemisphericLight("Hemi", new Vector3(0, 1, 0), { intensity: 0.2, diffuse: new Color3(0.8, 0.8, 1) });
        
        this._lights.dir = LightingManager.instance.createDirectionalLight("Dir", new Vector3(-1, -2, -1), { intensity: 0.8, diffuse: new Color3(1, 0.9, 0.8) });
        this._lights.dir.position = new Vector3(5, 8, 5);
        LightingManager.instance.toggleShadows(this._lights.dir, true, this._meshes);

        this._lights.spot = LightingManager.instance.createSpotLight("Spot", new Vector3(0, 8, -5), new Vector3(0, -1, 1), Math.PI / 3, 2, { intensity: 1.5, diffuse: new Color3(1, 0, 0) });
        LightingManager.instance.toggleShadows(this._lights.spot, true, this._meshes);

        this._lights.point = LightingManager.instance.createPointLight("Point", new Vector3(-5, 4, 0), { intensity: 1.0, diffuse: new Color3(0, 0, 1) });
        LightingManager.instance.toggleShadows(this._lights.point, true, this._meshes);
    }

    private _createGizmos(): void {
        if (!this._scene) return;
        this._utilityLayer = new UtilityLayerRenderer(this._scene);
        this._gizmoManager = new GizmoManager(this._scene);
        this._gizmoManager.positionGizmoEnabled = true;
        this._gizmoManager.rotationGizmoEnabled = true;
        this._gizmoManager.usePointerToAttachGizmos = false; // We will attach manually via UI selection

        const addLightGizmo = (light: Light) => {
            const gizmo = new LightGizmo(this._utilityLayer!);
            gizmo.light = light;
            gizmo.scaleRatio = 2;
            this._gizmos.set(light.name, gizmo);
        };

        if (this._lights.dir) addLightGizmo(this._lights.dir);
        if (this._lights.spot) addLightGizmo(this._lights.spot);
        if (this._lights.point) addLightGizmo(this._lights.point);
    }

    private _buildUI(): void {
        const uiLayer = document.getElementById("ui-layer");
        if (!uiLayer) return;

        this._uiContainer = document.createElement("div");
        this._uiContainer.className = "light-panel show";
        
        const header = document.createElement("div");
        header.className = "light-header";
        header.innerHTML = `
            <h2 class="light-title">Lighting Studio</h2>
            <p style="margin:6px 0 0;font-size:0.85rem;color:#ccc;">Double-click canvas to reset camera.</p>
        `;
        this._uiContainer.appendChild(header);

        const lightsList = [
            { id: "Hemi", light: this._lights.hemi, type: "Hemispheric", hasShadows: false, hasPosition: false },
            { id: "Dir", light: this._lights.dir, type: "Directional", hasShadows: true, hasPosition: true },
            { id: "Spot", light: this._lights.spot, type: "Spot", hasShadows: true, hasPosition: true },
            { id: "Point", light: this._lights.point, type: "Point", hasShadows: true, hasPosition: true }
        ];

        lightsList.forEach(item => {
            if (!item.light) return;
            
            const btn = document.createElement("button");
            btn.className = "light-accordion-btn";
            btn.innerHTML = `<span>${item.type} Light</span> <span style="color:#00d2ff;">◉</span>`;
            
            const content = document.createElement("div");
            content.className = "light-accordion-content";

            // Enabled Checkbox
            const enControl = document.createElement("label");
            enControl.className = "checkbox-control";
            enControl.innerHTML = `<input type="checkbox" checked /> Enabled`;
            const enInput = enControl.querySelector("input")!;
            enInput.onchange = () => {
                item.light!.setEnabled(enInput.checked);
            };
            content.appendChild(enControl);

            // Shadows Checkbox
            if (item.hasShadows) {
                const shControl = document.createElement("label");
                shControl.className = "checkbox-control";
                shControl.innerHTML = `<input type="checkbox" checked /> Cast Shadows`;
                const shInput = shControl.querySelector("input")!;
                shInput.onchange = () => {
                    LightingManager.instance.toggleShadows(item.light as IShadowLight, shInput.checked, this._meshes);
                };
                content.appendChild(shControl);
            }

            // Intensity
            const intControl = document.createElement("div");
            intControl.className = "mat-control";
            intControl.innerHTML = `<label>Intensity <span class="val">${item.light.intensity.toFixed(2)}</span></label><input type="range" min="0" max="5" step="0.1" value="${item.light.intensity}" />`;
            const intInput = intControl.querySelector("input")!;
            const intVal = intControl.querySelector(".val")!;
            intInput.oninput = () => {
                item.light!.intensity = parseFloat(intInput.value);
                intVal.textContent = item.light!.intensity.toFixed(2);
            };
            content.appendChild(intControl);

            // Color
            const colControl = document.createElement("div");
            colControl.className = "mat-control";
            colControl.innerHTML = `<label>Diffuse Color</label><input type="color" value="${item.light.diffuse.toHexString()}" />`;
            const colInput = colControl.querySelector("input")!;
            colInput.oninput = () => {
                LightingManager.instance.setLightColor(item.light!, colInput.value);
            };
            content.appendChild(colControl);

            // Read-only Position Labels
            let posLabel: HTMLElement | null = null;
            if (item.hasPosition) {
                posLabel = document.createElement("div");
                posLabel.style.fontSize = "0.75rem";
                posLabel.style.color = "#aaa";
                posLabel.style.fontFamily = "monospace";
                posLabel.style.marginTop = "8px";
                content.appendChild(posLabel);
            }

            // Accordion Logic
            btn.onclick = () => {
                const isActive = btn.classList.contains("active");
                // close all
                document.querySelectorAll(".light-accordion-btn").forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".light-accordion-content").forEach((c: any) => c.style.display = "none");
                this._gizmoManager!.attachToMesh(null);

                if (!isActive) {
                    btn.classList.add("active");
                    content.style.display = "flex";
                    this._focusLight(item.light!);
                    
                    if (item.hasPosition) {
                        const gizmo = this._gizmos.get(item.id);
                        if (gizmo && gizmo.attachedMesh) {
                            this._gizmoManager!.attachToMesh(gizmo.attachedMesh);
                        }
                    }
                } else {
                    this._resetCamera();
                }
            };

            // Update loop for positions
            if (this._scene && item.hasPosition) {
                if (!this._uiRefreshObserver) {
                    this._uiRefreshObserver = this._scene.onBeforeRenderObservable.add(() => {
                        // this runs every frame
                    });
                }
                this._scene.onBeforeRenderObservable.add(() => {
                    if (posLabel && item && item.light && (item.light as any).position) {
                        const p = (item.light as any).position;
                        posLabel.innerHTML = `POS: X:${p.x.toFixed(1)} Y:${p.y.toFixed(1)} Z:${p.z.toFixed(1)}`;
                    }
                });
            }

            this._uiContainer!.appendChild(btn);
            this._uiContainer!.appendChild(content);
        });

        uiLayer.appendChild(this._uiContainer);
    }
}
