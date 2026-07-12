import { SceneManager } from "./SceneManager";
import { CameraManager } from "../camera/CameraManager";
import { DebugManager } from "../debug/DebugManager";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Observable, Observer } from "@babylonjs/core/Misc/observable";
import { PointerInfo, PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { KeyboardInfo, KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";

export class InteractionManager {
    private static _instance: InteractionManager;

    private _highlightLayer: HighlightLayer | null = null;
    private _hoveredMesh: AbstractMesh | null = null;
    private _selectedMesh: AbstractMesh | null = null;
    
    private _pointerObserver: Observer<PointerInfo> | null = null;
    private _keyboardObserver: Observer<KeyboardInfo> | null = null;

    public onMeshSelected: Observable<AbstractMesh | null> = new Observable<AbstractMesh | null>();

    private constructor() {}

    public static initialize(): InteractionManager {
        if (!InteractionManager._instance) {
            InteractionManager._instance = new InteractionManager();
            InteractionManager._instance._setup();
        }
        return InteractionManager._instance;
    }

    public static get instance(): InteractionManager {
        if (!InteractionManager._instance) {
            throw new Error("InteractionManager not initialized. Call initialize() first.");
        }
        return InteractionManager._instance;
    }

    private _setup(): void {
        SceneManager.instance.onSceneChanged.add((scene) => {
            this._bindToScene(scene);
        });
        
        // Bind to current scene if it exists
        try {
            const scene = SceneManager.instance.scene;
            this._bindToScene(scene);
        } catch (e) {
            // Ignored, scene might not be set yet
        }
    }

    private _bindToScene(scene: Scene): void {
        this._hoveredMesh = null;
        this._selectedMesh = null;

        if (this._highlightLayer) {
            this._highlightLayer.dispose();
            this._highlightLayer = null;
        }

        // Initialize Highlight Layer
        this._highlightLayer = new HighlightLayer("highlight", scene);
        this._highlightLayer.innerGlow = false;
        
        // Remove old observers if any
        if (this._pointerObserver && scene.onPointerObservable.hasObservers()) {
            scene.onPointerObservable.remove(this._pointerObserver);
        }
        if (this._keyboardObserver && scene.onKeyboardObservable.hasObservers()) {
            scene.onKeyboardObservable.remove(this._keyboardObserver);
        }

        // Pointer Events (Hover & Click)
        this._pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERMOVE:
                    this._handleHover(pointerInfo.pickInfo?.pickedMesh || null);
                    break;
                case PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.button === 0) { // Left click
                        this._handleClick(pointerInfo.pickInfo?.pickedMesh || null);
                    }
                    break;
            }
        });

        // Keyboard Shortcuts
        this._keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                switch (kbInfo.event.key.toLowerCase()) {
                    case "f": // Focus
                        if (this._selectedMesh) {
                            CameraManager.instance.focusOn(this._selectedMesh);
                        }
                        break;
                    case "r": // Reset
                        CameraManager.instance.reset();
                        break;
                    case "i": // Inspector (Assuming DebugManager doesn't already handle raw "i")
                        DebugManager.instance.toggleInspector();
                        break;
                }
            }
        });
    }

    private _isValidTarget(mesh: AbstractMesh | null): boolean {
        if (!mesh) return false;
        // Ignore structural meshes
        if (mesh.name === "EnvironmentSkybox" || mesh.name === "showroomFloor" || mesh.name === "platform" || mesh.name.startsWith("ped_")) {
            return false;
        }
        return true;
    }

    private _handleHover(mesh: AbstractMesh | null): void {
        const target = this._isValidTarget(mesh) ? mesh : null;
        
        if (this._hoveredMesh === target) return;

        // Remove old highlight if it wasn't the selected mesh
        if (this._hoveredMesh && this._highlightLayer && this._hoveredMesh !== this._selectedMesh) {
            this._highlightLayer.removeMesh(this._hoveredMesh as any);
        }

        this._hoveredMesh = target;

        // Apply new highlight if not already selected
        if (this._hoveredMesh && this._highlightLayer && this._hoveredMesh !== this._selectedMesh) {
            this._highlightLayer.addMesh(this._hoveredMesh as any, Color3.White());
        }
    }

    private _handleClick(mesh: AbstractMesh | null): void {
        const target = this._isValidTarget(mesh) ? mesh : null;

        if (this._selectedMesh === target) return;

        // Deselect old
        if (this._selectedMesh && this._highlightLayer) {
            this._highlightLayer.removeMesh(this._selectedMesh as any);
        }

        this._selectedMesh = target;

        // Select new
        if (this._selectedMesh && this._highlightLayer) {
            this._highlightLayer.addMesh(this._selectedMesh as any, Color3.Yellow());
            CameraManager.instance.focusOn(this._selectedMesh);
        } else {
            CameraManager.instance.reset();
        }

        // Notify UI
        this.onMeshSelected.notifyObservers(this._selectedMesh);
    }
}
