import { Engine } from "@babylonjs/core/Engines/engine";

export class EngineManager {
    private static _instance: EngineManager;
    private _engine: Engine;
    private _canvas: HTMLCanvasElement;

    private constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        
        // Initialize Babylon.js engine with antialiasing enabled
        this._engine = new Engine(this._canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false
        });
        
        this._handleResize();
    }

    public static initialize(canvas: HTMLCanvasElement): EngineManager {
        if (!EngineManager._instance) {
            EngineManager._instance = new EngineManager(canvas);
        }
        return EngineManager._instance;
    }

    public static get instance(): EngineManager {
        if (!EngineManager._instance) {
            throw new Error("EngineManager has not been initialized. Call initialize(canvas) first.");
        }
        return EngineManager._instance;
    }

    public get engine(): Engine {
        return this._engine;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    private _handleResize(): void {
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
    }
}
