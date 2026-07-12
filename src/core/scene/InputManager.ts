import { SceneManager } from "./SceneManager";
import { EventBus } from "../events/EventBus";
import { EngineEvents } from "../events/EngineEvents";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents";
import { Observer } from "@babylonjs/core/Misc/observable";

export class InputManager {
    private static _instance: InputManager;
    
    private _pointerObserver: Observer<PointerInfo> | null = null;
    private _keyboardObserver: Observer<KeyboardInfo> | null = null;

    private constructor() {}

    public static initialize(): InputManager {
        if (!InputManager._instance) {
            InputManager._instance = new InputManager();
            InputManager._instance._setup();
        }
        return InputManager._instance;
    }

    public static get instance(): InputManager {
        if (!InputManager._instance) {
            throw new Error("InputManager not initialized.");
        }
        return InputManager._instance;
    }

    private _setup(): void {
        EventBus.instance.on(EngineEvents.SceneChanged, () => {
            this._bindToActiveScene();
        });
        
        // Initial bind if scene already exists
        if (SceneManager.instance.scene) {
            this._bindToActiveScene();
        }
    }

    private _bindToActiveScene(): void {
        const scene = SceneManager.instance.scene;
        
        if (this._pointerObserver && scene.onPointerObservable.hasObservers()) {
            scene.onPointerObservable.remove(this._pointerObserver);
        }
        if (this._keyboardObserver && scene.onKeyboardObservable.hasObservers()) {
            scene.onKeyboardObservable.remove(this._keyboardObserver);
        }

        this._pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN && pointerInfo.event.button === 0) {
                const mesh = pointerInfo.pickInfo?.pickedMesh || null;
                EventBus.instance.emit(EngineEvents.ObjectSelected, { mesh });
            }
            if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                const mesh = pointerInfo.pickInfo?.pickedMesh || null;
                EventBus.instance.emit(EngineEvents.ObjectHovered, { mesh });
            }
        });

        this._keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                // Let other systems handle specific keys via their own observables or 
                // we can emit a global KeyDown event here if needed.
            }
        });
    }
}
