import { EventBus } from "../events/EventBus";
import { EngineEvents, IStudioActivatedPayload, ISceneChangedPayload, IObjectSelectedPayload, IMaterialSelectedPayload, ILightSelectedPayload, ICameraChangedPayload } from "../events/EngineEvents";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Material } from "@babylonjs/core/Materials/material";
import { Light } from "@babylonjs/core/Lights/light";

export class StateManager {
    private static _instance: StateManager;
    
    // Centralized Application State
    public currentStudio: string = "Home";
    public currentScene: Scene | null = null;
    public currentCamera: Camera | null = null;
    public selectedObject: AbstractMesh | null = null;
    public selectedMaterial: Material | null = null;
    public selectedLight: Light | null = null;

    private constructor() {}

    public static initialize(): StateManager {
        if (!StateManager._instance) {
            StateManager._instance = new StateManager();
            StateManager._instance._setupSubscriptions();
        }
        return StateManager._instance;
    }

    public static get instance(): StateManager {
        if (!StateManager._instance) {
            throw new Error("StateManager not initialized.");
        }
        return StateManager._instance;
    }

    private _setupSubscriptions(): void {
        const bus = EventBus.instance;

        bus.on<IStudioActivatedPayload>(EngineEvents.StudioActivated, (payload) => {
            this.currentStudio = payload.studioName;
        });

        bus.on<ISceneChangedPayload>(EngineEvents.SceneChanged, (payload) => {
            this.currentScene = payload.scene;
            // Reset selection context on scene switch
            this.selectedObject = null;
            this.selectedMaterial = null;
            this.selectedLight = null;
        });

        bus.on<IObjectSelectedPayload>(EngineEvents.ObjectSelected, (payload) => {
            this.selectedObject = payload.mesh;
        });

        bus.on<IMaterialSelectedPayload>(EngineEvents.MaterialSelected, (payload) => {
            this.selectedMaterial = payload.material;
        });

        bus.on<ILightSelectedPayload>(EngineEvents.LightSelected, (payload) => {
            this.selectedLight = payload.light;
        });

        bus.on<ICameraChangedPayload>(EngineEvents.CameraChanged, (payload) => {
            this.currentCamera = payload.camera;
        });
    }
}
