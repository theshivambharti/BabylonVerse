import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import { ConfigManager } from "../config/ConfigManager";
import { EventBus } from "../events/EventBus";
import { EngineEvents } from "../events/EngineEvents";

export class RendererManager {
    private static _instance: RendererManager;
    private _pipelines: Map<string, DefaultRenderingPipeline> = new Map();

    private constructor() {}

    public static initialize(): RendererManager {
        if (!RendererManager._instance) {
            RendererManager._instance = new RendererManager();
            RendererManager._instance._setupConfigListener();
        }
        return RendererManager._instance;
    }

    public static get instance(): RendererManager {
        if (!RendererManager._instance) {
            throw new Error("RendererManager not initialized.");
        }
        return RendererManager._instance;
    }

    private _setupConfigListener(): void {
        EventBus.instance.on(EngineEvents.ConfigChanged, () => {
            this._applyConfigToAllPipelines();
        });
    }

    public setupPipeline(scene: Scene): DefaultRenderingPipeline {
        if (this._pipelines.has(scene.uid)) {
            return this._pipelines.get(scene.uid)!;
        }

        const pipeline = new DefaultRenderingPipeline(
            "defaultPipeline",
            true,
            scene,
            scene.cameras
        );

        this._applyConfigToPipeline(pipeline);
        this._pipelines.set(scene.uid, pipeline);

        return pipeline;
    }

    public disposePipeline(scene: Scene): void {
        if (this._pipelines.has(scene.uid)) {
            this._pipelines.get(scene.uid)!.dispose();
            this._pipelines.delete(scene.uid);
        }
    }

    private _applyConfigToPipeline(pipeline: DefaultRenderingPipeline): void {
        const config = ConfigManager.instance;
        
        pipeline.samples = config.msaaSamples;
        pipeline.fxaaEnabled = config.graphicsQuality === "high";
        pipeline.bloomEnabled = config.graphicsQuality === "high";
        if (pipeline.bloomEnabled) {
            pipeline.bloomThreshold = 0.8;
            pipeline.bloomWeight = 0.3;
        }
        // Additional post-processes based on config...
    }

    private _applyConfigToAllPipelines(): void {
        this._pipelines.forEach(pipeline => {
            this._applyConfigToPipeline(pipeline);
        });
    }
}

