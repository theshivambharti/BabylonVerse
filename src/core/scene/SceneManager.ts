import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { EngineManager } from "../engine/EngineManager";
import { Observable } from "@babylonjs/core/Misc/observable";

export class SceneManager {
    private static _instance: SceneManager;
    private _scene: Scene | null = null;
    
    public onSceneChanged: Observable<Scene> = new Observable<Scene>();

    private constructor() {}

    public static initialize(): SceneManager {
        if (!SceneManager._instance) {
            SceneManager._instance = new SceneManager();
        }
        return SceneManager._instance;
    }

    public static get instance(): SceneManager {
        if (!SceneManager._instance) {
            throw new Error("SceneManager has not been initialized. Call initialize() first.");
        }
        return SceneManager._instance;
    }

    public createScene(): Scene {
        const engine = EngineManager.instance.engine;
        const scene = new Scene(engine);
        // Professional dark gray background
        scene.clearColor = new Color4(0.05, 0.05, 0.05, 1.0); 
        return scene;
    }

    public setActiveScene(scene: Scene): void {
        this._scene = scene;
        this.onSceneChanged.notifyObservers(scene);
    }

    public get scene(): Scene {
        if (!this._scene) {
            throw new Error("No active scene set. Call setActiveScene() first.");
        }
        return this._scene;
    }

    public startRenderLoop(): void {
        const engine = EngineManager.instance.engine;
        engine.runRenderLoop(() => {
            if (this._scene && this._scene.activeCamera) {
                this._scene.render();
            }
        });
    }
}
