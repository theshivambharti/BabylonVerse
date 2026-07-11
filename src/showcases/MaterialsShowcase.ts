import { SceneManager } from "../core/scene/SceneManager";
import { CameraManager } from "../core/camera/CameraManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { EnvironmentManager } from "../core/environment/EnvironmentManager";
import { MaterialManager } from "../core/materials/MaterialManager";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { PointerInfo, PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Observer } from "@babylonjs/core/Misc/observable";
import { AdvancedDynamicTexture, TextBlock, Rectangle } from "@babylonjs/gui";
import gsap from "gsap";

const envStudio = "/assets/hdr/environment.env";
const envNight = "/assets/hdr/night.env";
const envOutdoor = "/assets/hdr/outdoor.env";

import { IShowcase } from "../core/interfaces/IShowcase";
import { Scene } from "@babylonjs/core/scene";

export class MaterialsShowcase implements IShowcase {
    private _scene: Scene | null = null;
    private _uiContainer: HTMLElement | null = null;
    private _selectedMesh: AbstractMesh | null = null;
    private _highlightLayer: HighlightLayer | null = null;
    private _pointerObserver: Observer<PointerInfo> | null = null;
    private _renderObserver: Observer<any> | null = null;
    
    private _materialsMap: Map<string, PBRMaterial> = new Map();
    private _materialMeshes: AbstractMesh[] = [];
    private _floor: AbstractMesh | null = null;
    private _guiTexture: AdvancedDynamicTexture | null = null;

    private _envOptions = {
        "Studio": envStudio,
        "Outdoor": envOutdoor,
        "Dark Room": envNight
    };

    public async load(): Promise<void> {
        console.log("Starting Materials Showcase load sequence...");
        
        // Instantiate dedicated scene
        this._scene = SceneManager.instance.createScene();
        SceneManager.instance.setActiveScene(this._scene);

        this._guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this._setupCamera();
        const shadowGen = this._setupLighting();
        
        console.log(`Loading HDR from: ${this._envOptions["Studio"]}`);
        try {
            await this._setupEnvironment(this._envOptions["Studio"]);
            console.log("HDR Loaded");
        } catch (err) {
            console.error(`Failed to load HDR from ${this._envOptions["Studio"]}:`, err);
        }
        
        console.log("Building Floor...");
        this._createFloor();
        
        console.log("Loading Model...");
        console.log("Model Loaded"); 
        
        console.log("Creating Materials and Samples...");
        this._createMaterialSamples(shadowGen);
        console.log("Materials Created");
        
        this._setupInteractions();
        this._startAnimations();
        
        const scene = SceneManager.instance.scene;
        scene.materials.forEach(m => {
            if ("maxSimultaneousLights" in m) {
                (m as any).maxSimultaneousLights = 16;
            }
        });

        this._buildSelectorsUI();
        console.log("Scene Ready");
    }

    public unload(): void {
        this._removeUI();
        const scene = SceneManager.instance.scene;
        if (this._pointerObserver) {
            scene.onPointerObservable.remove(this._pointerObserver);
            this._pointerObserver = null;
        }
        if (this._renderObserver) {
            scene.onBeforeRenderObservable.remove(this._renderObserver);
            this._renderObserver = null;
        }
        if (this._highlightLayer) {
            this._highlightLayer.dispose();
            this._highlightLayer = null;
        }
        if (this._guiTexture) {
            this._guiTexture.dispose();
            this._guiTexture = null;
        }
        this._selectedMesh = null;
        this._materialMeshes = [];
        this._materialsMap.clear();
        this._floor = null;
        
        const selectors = document.getElementById("mat-selectors");
        if (selectors) selectors.remove();
        
        const camShortcuts = document.getElementById("cam-shortcuts");
        if (camShortcuts) camShortcuts.remove();

        if (this._scene) {
            this._scene.dispose();
            this._scene = null;
        }
    }

    private _setupCamera(): void {
        const camera = CameraManager.instance.createArcRotateCamera("ShowcaseCamera");
        // Wide framing for 10 elements on radius 6.5
        camera.setPosition(new Vector3(0, 8, -20));
        camera.setTarget(new Vector3(0, 1.5, 0));
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 35;
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI / 2 - 0.05; // Keep camera strictly above floor
        camera.wheelPrecision = 50;
    }

    private _setupLighting(): any {
        const scene = SceneManager.instance.scene;
        const lm = LightingManager.instance;
        
        // Base ambient fill
        const hemi = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
        hemi.intensity = 0.7;
        hemi.groundColor = new Color3(0.2, 0.2, 0.2);
        hemi.specular = new Color3(0.5, 0.5, 0.5);

        // Key light for crisp shadows
        lm.createDirectionalLight("keyLight", new Vector3(-1, -2, -1.5), {
            intensity: 2.0,
            diffuse: new Color3(1, 0.98, 0.95),
            specular: new Color3(1, 1, 1),
            castShadows: true
        });

        // Fill light to prevent pitch black shadow sides
        lm.createDirectionalLight("fillLight", new Vector3(1, -0.5, 1), {
            intensity: 0.8,
            diffuse: new Color3(0.8, 0.85, 1.0),
            castShadows: false
        });

        const shadowGen = lm.getShadowGenerator("keyLight");
        if (shadowGen) {
            shadowGen.useBlurExponentialShadowMap = true;
            shadowGen.useKernelBlur = true;
            shadowGen.blurKernel = 32;
            shadowGen.bias = 0.005;
        }
        return shadowGen;
    }

    private async _setupEnvironment(envUrl: string): Promise<void> {
        const env = EnvironmentManager.instance;
        // The background is set to true to load skybox. We MUST have a skybox to prevent black background
        await env.setupHDR(envUrl, true);
        
        const scene = SceneManager.instance.scene;
        scene.imageProcessingConfiguration.exposure = 1.2;
        scene.imageProcessingConfiguration.contrast = 1.1;
        scene.imageProcessingConfiguration.toneMappingEnabled = true;
    }

    private _createFloor(): void {
        const scene = SceneManager.instance.scene;
        this._floor = MeshBuilder.CreateCylinder("showroomFloor", { height: 0.2, diameter: 20, tessellation: 64 }, scene);
        this._floor.position.y = -0.1; // Place exactly below origin
        this._floor.receiveShadows = true;
        this._setFloorMaterial("Marble"); // Default
    }

    private _setFloorMaterial(type: string): void {
        if (!this._floor) return;
        const mm = MaterialManager.instance;
        let mat: PBRMaterial;

        switch (type) {
            case "Concrete":
                mat = mm.createConcrete("floor_concrete");
                mat.albedoColor = new Color3(0.3, 0.3, 0.3);
                mat.roughness = 0.4;
                break;
            case "Wood":
                mat = mm.createWood("floor_wood");
                mat.albedoColor = new Color3(0.25, 0.2, 0.15);
                mat.roughness = 0.2;
                mat.metallic = 0.1;
                break;
            case "Marble":
            default:
                mat = mm.createMarble("floor_marble");
                mat.albedoColor = new Color3(0.9, 0.9, 0.9); // White marble for premium look
                mat.metallic = 0.1;
                mat.roughness = 0.2;
                break;
        }
        mat.maxSimultaneousLights = 16;
        this._floor.material = mat;
    }

    private _createMaterialSamples(shadowGen: any): void {
        const scene = SceneManager.instance.scene;
        const mm = MaterialManager.instance;
        
        // Row 1
        this._materialsMap.set("Glass", mm.createGlass("Glass"));
        this._materialsMap.set("Chrome", mm.createChrome("Chrome"));
        this._materialsMap.set("Gold", mm.createGold("Gold"));
        this._materialsMap.set("Copper", mm.createCopper("Copper"));
        
        // Row 2
        this._materialsMap.set("Plastic", mm.createPlastic("Plastic", new Color3(0.8, 0.2, 0.2)));
        this._materialsMap.set("Rubber", mm.createRubber("Rubber"));
        this._materialsMap.set("Wood", mm.createWood("Wood"));
        this._materialsMap.set("Marble", mm.createMarble("Marble"));
        
        // Row 3
        this._materialsMap.set("Fabric", mm.createFabric("Fabric"));
        this._materialsMap.set("Carbon Fiber", mm.createCarbonFiber("Carbon Fiber"));
        this._materialsMap.set("Concrete", mm.createConcrete("Concrete"));
        this._materialsMap.set("Paint", mm.createPaint("Paint"));

        const entries = Array.from(this._materialsMap.entries());
        
        const cols = 4;
        const spacingX = 3.5;
        const spacingZ = 4.0;
        
        for (let i = 0; i < entries.length; i++) {
            const [name, material] = entries[i];
            
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const x = (col - (cols - 1) / 2) * spacingX;
            const z = -(row - 1) * spacingZ;
            
            const height = 1.0;
            const pedestalY = height / 2;
            
            const ped = MeshBuilder.CreateCylinder(`ped_${name}`, { height: height, diameter: 1.2, tessellation: 64 }, scene);
            ped.position = new Vector3(x, pedestalY, z);
            const pedMat = mm.createConcrete(`pedMat_${name}`);
            pedMat.albedoColor = new Color3(0.2, 0.2, 0.2);
            pedMat.roughness = 0.5;
            ped.material = pedMat;
            
            const bevel = MeshBuilder.CreateTorus(`bevel_${name}`, { diameter: 1.2, thickness: 0.05, tessellation: 64 }, scene);
            bevel.position = new Vector3(x, height, z);
            bevel.material = pedMat;

            const ring = MeshBuilder.CreateTorus(`ring_${name}`, { diameter: 1.3, thickness: 0.03, tessellation: 64 }, scene);
            ring.position = new Vector3(x, 0.02, z);
            const ringMat = mm.createEmissiveNeon(`ringMat_${name}`, new Color3(0.0, 0.8, 1.0));
            ringMat.emissiveIntensity = 0.5;
            ring.material = ringMat;
            
            const sphereY = height + 0.75;
            const sphere = MeshBuilder.CreateSphere(`mat_${name}`, { diameter: 1.5, segments: 64 }, scene);
            sphere.position = new Vector3(x, sphereY, z);
            sphere.material = material;
            sphere.metadata = { originalScale: sphere.scaling.clone(), name: name, originalY: sphereY };
            this._materialMeshes.push(sphere);
            
            this._create3DLabel(name, ped);

            if (shadowGen) {
                shadowGen.addShadowCaster(ped);
                shadowGen.addShadowCaster(bevel);
                shadowGen.addShadowCaster(sphere);
            }
        }
    }

    private _create3DLabel(text: string, mesh: AbstractMesh): void {
        if (!this._guiTexture) return;
        
        const rect = new Rectangle();
        rect.width = "120px";
        rect.height = "35px";
        rect.cornerRadius = 8;
        rect.color = "rgba(255, 255, 255, 0.9)";
        rect.thickness = 1;
        rect.background = "rgba(10, 10, 10, 0.7)";
        
        // Link to the pedestal (mesh), offset downwards so it sits below the base
        this._guiTexture.addControl(rect);
        rect.linkWithMesh(mesh);
        rect.linkOffsetY = 80; // Positive goes DOWN from mesh center
        
        const label = new TextBlock();
        label.text = text;
        label.color = "white";
        label.fontSize = 14;
        label.fontWeight = "bold";
        label.fontFamily = "system-ui, sans-serif";
        rect.addControl(label);
    }

    private _setupInteractions(): void {
        const scene = SceneManager.instance.scene;
        this._highlightLayer = new HighlightLayer("hl1", scene);

        let hoveredMesh: AbstractMesh | null = null;

        this._pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERMOVE:
                    const pickResult = scene.pick(scene.pointerX, scene.pointerY);
                    if (pickResult && pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.name.startsWith("mat_")) {
                        const mesh = pickResult.pickedMesh;
                        if (hoveredMesh !== mesh) {
                            if (hoveredMesh && hoveredMesh !== this._selectedMesh) {
                                gsap.to(hoveredMesh.scaling, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" });
                                gsap.to(hoveredMesh.position, { y: hoveredMesh.metadata.originalY, duration: 0.3, ease: "power2.out" });
                            }
                            hoveredMesh = mesh;
                            if (hoveredMesh !== this._selectedMesh) {
                                gsap.to(hoveredMesh.scaling, { x: 1.15, y: 1.15, z: 1.15, duration: 0.4, ease: "back.out(1.7)" });
                                gsap.to(hoveredMesh.position, { y: hoveredMesh.metadata.originalY + 0.3, duration: 0.4, ease: "back.out(1.7)" });
                            }
                            document.body.style.cursor = "pointer";
                        }
                    } else {
                        if (hoveredMesh) {
                            if (hoveredMesh !== this._selectedMesh) {
                                gsap.to(hoveredMesh.scaling, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" });
                                gsap.to(hoveredMesh.position, { y: hoveredMesh.metadata.originalY, duration: 0.3, ease: "power2.out" });
                            }
                            hoveredMesh = null;
                            document.body.style.cursor = "default";
                        }
                    }
                    break;
                case PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.button !== 0) return;
                    
                    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
                    if (pickInfo && pickInfo.hit && pickInfo.pickedMesh && pickInfo.pickedMesh.name.startsWith("mat_")) {
                        this._selectMesh(pickInfo.pickedMesh);
                    } else if (pointerInfo.event.detail === 2) {
                        this._resetCamera();
                    }
                    break;
            }
        });
    }

    private _selectMesh(mesh: AbstractMesh): void {
        const camera = CameraManager.instance.activeCamera as any;
        
        if (this._selectedMesh) {
            this._highlightLayer?.removeMesh(this._selectedMesh as any);
            gsap.to(this._selectedMesh.scaling, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
            gsap.to(this._selectedMesh.position, { y: this._selectedMesh.metadata.originalY, duration: 0.4, ease: "power2.out" });
        }

        this._selectedMesh = mesh;
        this._highlightLayer?.addMesh(this._selectedMesh as any, Color3.Teal());
        gsap.to(this._selectedMesh.scaling, { x: 1.25, y: 1.25, z: 1.25, duration: 0.5, ease: "elastic.out(1, 0.4)" });
        gsap.to(this._selectedMesh.position, { y: this._selectedMesh.metadata.originalY + 0.5, duration: 0.5, ease: "elastic.out(1, 0.4)" });

        // Fade out other materials
        this._materialMeshes.forEach(m => {
            if (m !== this._selectedMesh) {
                if (m.material) {
                    m.material.alpha = 0.2;
                }
            } else {
                if (m.material) {
                    m.material.alpha = 1.0;
                }
            }
        });

        if (camera) {
            const newRadius = 5; 
            
            gsap.to(camera, {
                radius: newRadius,
                alpha: Math.PI / 2, // Face directly
                beta: Math.PI / 2.3, // Slightly higher angle
                duration: 1.5,
                ease: "power2.inOut"
            });
            gsap.to(camera.target, {
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z,
                duration: 1.5,
                ease: "power2.inOut"
            });
        }

        this._showUI(mesh.metadata.name, mesh.material as PBRMaterial);
    }

    private _resetCamera(): void {
        if (this._selectedMesh) {
            this._highlightLayer?.removeMesh(this._selectedMesh as any);
            gsap.to(this._selectedMesh.scaling, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
            gsap.to(this._selectedMesh.position, { y: this._selectedMesh.metadata.originalY, duration: 0.4, ease: "power2.out" });
            this._selectedMesh = null;
        }

        // Restore alphas
        this._materialMeshes.forEach(m => {
            if (m.material) {
                // If it is glass, restore it to 0.3, otherwise 1.0
                m.material.alpha = m.metadata.name === "Glass" ? 0.3 : 1.0;
            }
        });

        this._hideUI();

        const camera = CameraManager.instance.activeCamera as any;
        if (camera) {
            gsap.to(camera, {
                radius: 20,
                alpha: Math.PI / 2, // Straight on for grid
                beta: Math.PI / 3,
                duration: 1.5,
                ease: "power2.inOut"
            });
            gsap.to(camera.target, {
                x: 0,
                y: 1.5,
                z: 0,
                duration: 1.5,
                ease: "power2.inOut"
            });
        }
    }

    private _startAnimations(): void {
        const scene = SceneManager.instance.scene;
        const camera = CameraManager.instance.activeCamera as any;
        
        if (camera) {
            gsap.fromTo(camera, 
                { radius: 35, alpha: 0 },
                { radius: 20, alpha: Math.PI / 2, duration: 3.5, ease: "power2.out" }
            );
        }

        let angle = 0;
        this._renderObserver = scene.onBeforeRenderObservable.add(() => {
            const dt = scene.getEngine().getDeltaTime() * 0.001; 
            angle += dt;
            const count = this._materialMeshes.length;
            
            // Gently rotate spheres individually
            for (let i = 0; i < count; i++) {
                const mesh = this._materialMeshes[i];
                mesh.rotation.y = angle * 0.5;
                mesh.rotation.x = Math.sin(angle * 0.2 + i) * 0.2;
            }
        });
    }

    // --- HTML UI Methods ---

    private _buildSelectorsUI(): void {
        const uiLayer = document.getElementById("ui-layer");
        if (!uiLayer) return;

        const container = document.createElement("div");
        container.id = "mat-selectors";
        container.style.position = "absolute";
        container.style.top = "20px";
        container.style.left = "20px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "12px";
        container.style.pointerEvents = "auto";
        container.style.background = "rgba(15, 15, 15, 0.7)";
        container.style.padding = "16px";
        container.style.borderRadius = "8px";
        container.style.backdropFilter = "blur(10px)";
        container.style.border = "1px solid rgba(255, 255, 255, 0.1)";

        // Environment Selector
        const envLabel = document.createElement("label");
        envLabel.textContent = "Environment";
        envLabel.style.color = "#ccc";
        envLabel.style.fontSize = "0.9rem";
        envLabel.style.display = "flex";
        envLabel.style.flexDirection = "column";
        envLabel.style.gap = "6px";
        
        const envSelect = document.createElement("select");
        envSelect.style.padding = "6px";
        envSelect.style.background = "#222";
        envSelect.style.color = "white";
        envSelect.style.border = "1px solid #444";
        envSelect.style.borderRadius = "4px";

        Object.keys(this._envOptions).forEach(env => {
            const opt = document.createElement("option");
            opt.value = env;
            opt.textContent = env;
            envSelect.appendChild(opt);
        });
        
        envSelect.onchange = (e: any) => {
            const selected = e.target.value;
            const url = (this._envOptions as any)[selected];
            this._setupEnvironment(url);
        };
        envLabel.appendChild(envSelect);

        // Floor Selector
        const floorLabel = document.createElement("label");
        floorLabel.textContent = "Floor Material";
        floorLabel.style.color = "#ccc";
        floorLabel.style.fontSize = "0.9rem";
        floorLabel.style.display = "flex";
        floorLabel.style.flexDirection = "column";
        floorLabel.style.gap = "6px";
        
        const floorSelect = document.createElement("select");
        floorSelect.style.padding = "6px";
        floorSelect.style.background = "#222";
        floorSelect.style.color = "white";
        floorSelect.style.border = "1px solid #444";
        floorSelect.style.borderRadius = "4px";

        ["Marble", "Concrete", "Wood"].forEach(f => {
            const opt = document.createElement("option");
            opt.value = f;
            opt.textContent = f;
            floorSelect.appendChild(opt);
        });

        floorSelect.onchange = (e: any) => {
            this._setFloorMaterial(e.target.value);
        };
        floorLabel.appendChild(floorSelect);

        container.appendChild(envLabel);
        container.appendChild(floorLabel);
        uiLayer.appendChild(container);

        // Bottom Camera Shortcuts
        const camShortcuts = document.createElement("div");
        camShortcuts.id = "cam-shortcuts";
        camShortcuts.style.position = "absolute";
        camShortcuts.style.bottom = "20px";
        camShortcuts.style.left = "50%";
        camShortcuts.style.transform = "translateX(-50%)";
        camShortcuts.style.display = "flex";
        camShortcuts.style.gap = "20px";
        camShortcuts.style.background = "rgba(15, 15, 15, 0.7)";
        camShortcuts.style.padding = "10px 20px";
        camShortcuts.style.borderRadius = "30px";
        camShortcuts.style.backdropFilter = "blur(10px)";
        camShortcuts.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        camShortcuts.style.pointerEvents = "auto";
        camShortcuts.style.color = "#ccc";
        camShortcuts.style.fontSize = "0.9rem";
        
        camShortcuts.innerHTML = `
            <span><strong>F</strong> Focus</span>
            <span><strong>R</strong> Reset</span>
            <span><strong>Shift+I</strong> Inspector</span>
            <span><strong>Shift+D</strong> Debug</span>
        `;
        uiLayer.appendChild(camShortcuts);
    }

    private _buildUI(): void {
        if (this._uiContainer) return;
        const uiLayer = document.getElementById("ui-layer");
        if (!uiLayer) return;

        this._uiContainer = document.createElement("div");
        this._uiContainer.className = "material-panel";

        this._uiContainer.innerHTML = `
            <div class="mat-header">
                <h2 class="mat-title" id="mat-title">Material Name</h2>
                <p class="mat-desc" id="mat-desc">Description goes here.</p>
            </div>
            <div class="mat-control">
                <label><span>Alpha</span><span id="lbl-alpha">1.0</span></label>
                <input type="range" id="slider-alpha" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Metallic</span><span id="lbl-metal">0.0</span></label>
                <input type="range" id="slider-metal" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Roughness</span><span id="lbl-rough">0.0</span></label>
                <input type="range" id="slider-rough" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Clear Coat</span><span id="lbl-cc">0.0</span></label>
                <input type="range" id="slider-cc" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Anisotropy</span><span id="lbl-aniso">0.0</span></label>
                <input type="range" id="slider-aniso" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Reflectivity</span><span id="lbl-refl">0.0</span></label>
                <input type="range" id="slider-refl" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Ambient</span><span id="lbl-ambient">0.0</span></label>
                <input type="range" id="slider-ambient" min="0" max="1" step="0.01">
            </div>
            <div class="mat-control">
                <label><span>Emissive</span><span id="lbl-emissive">#000000</span></label>
                <input type="color" id="color-emissive" value="#000000">
            </div>
            <div class="mat-control">
                <label><span>Tint (Albedo)</span><span id="lbl-tint">#ffffff</span></label>
                <input type="color" id="color-tint" value="#ffffff">
            </div>
        `;

        uiLayer.appendChild(this._uiContainer);
    }

    private _showUI(name: string, material: PBRMaterial): void {
        if (!this._uiContainer) {
            this._buildUI();
        }

        const title = document.getElementById("mat-title");
        const desc = document.getElementById("mat-desc");

        if (title) title.textContent = name;
        if (desc) desc.textContent = `Premium ${name.toLowerCase()} physically based material.`;

        const bindSlider = (id: string, lblId: string, val: number, setter: (v: number) => void) => {
            const slider = document.getElementById(id) as HTMLInputElement;
            const lbl = document.getElementById(lblId);
            if (slider && lbl) {
                slider.value = val.toString();
                lbl.textContent = val.toFixed(2);
                slider.oninput = (e: any) => {
                    const v = parseFloat(e.target.value);
                    setter(v);
                    lbl.textContent = v.toFixed(2);
                };
            }
        };

        const bindColor = (id: string, lblId: string, color: Color3, setter: (c: Color3) => void) => {
            const picker = document.getElementById(id) as HTMLInputElement;
            const lbl = document.getElementById(lblId);
            if (picker && lbl) {
                picker.value = color.toHexString().substring(0, 7);
                lbl.textContent = picker.value.toUpperCase();
                picker.oninput = (e: any) => {
                    const c = Color3.FromHexString(e.target.value);
                    setter(c);
                    lbl.textContent = e.target.value.toUpperCase();
                };
            }
        };

        bindSlider("slider-alpha", "lbl-alpha", material.alpha, (v) => material.alpha = v);
        bindSlider("slider-metal", "lbl-metal", material.metallic ?? 0, (v) => material.metallic = v);
        bindSlider("slider-rough", "lbl-rough", material.roughness ?? 0, (v) => material.roughness = v);
        
        bindSlider("slider-cc", "lbl-cc", material.clearCoat?.intensity ?? 0, (v) => {
            if (!material.clearCoat) return;
            material.clearCoat.isEnabled = v > 0;
            material.clearCoat.intensity = v;
        });

        bindSlider("slider-aniso", "lbl-aniso", material.anisotropy?.intensity ?? 0, (v) => {
            if (!material.anisotropy) return;
            material.anisotropy.isEnabled = v > 0;
            material.anisotropy.intensity = v;
        });

        bindSlider("slider-refl", "lbl-refl", material.environmentIntensity ?? 1.0, (v) => material.environmentIntensity = v);
        bindSlider("slider-ambient", "lbl-ambient", material.ambientTexture ? 1.0 : 0.0, (v) => {
            // For simple demonstration, ambient level scales albedo
            if(material.ambientColor) {
                material.ambientColor = new Color3(v, v, v);
            }
        });

        bindColor("color-emissive", "lbl-emissive", material.emissiveColor, (c) => {
            material.emissiveColor = c;
            material.emissiveIntensity = 1.0;
        });
        bindColor("color-tint", "lbl-tint", material.albedoColor, (c) => material.albedoColor = c);

        setTimeout(() => {
            if (this._uiContainer) this._uiContainer.classList.add("show");
        }, 50);
    }

    private _hideUI(): void {
        if (this._uiContainer) {
            this._uiContainer.classList.remove("show");
        }
    }

    private _removeUI(): void {
        if (this._uiContainer) {
            this._uiContainer.remove();
            this._uiContainer = null;
        }
    }
}
