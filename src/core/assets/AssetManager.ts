import { SceneLoader, ISceneLoaderProgressEvent } from "@babylonjs/core/Loading/sceneLoader";
import { AssetContainer, InstantiatedEntries } from "@babylonjs/core/assetContainer";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { HDRCubeTexture } from "@babylonjs/core/Materials/Textures/hdrCubeTexture";
import { Sound } from "@babylonjs/core/Audio/sound";
import { SceneManager } from "../scene/SceneManager";
import { Logger } from "../../utilities/Logger";

// Crucial: Register glTF/GLB loader plugin
import "@babylonjs/loaders/glTF"; 

export class AssetManager {
    private static _instance: AssetManager;

    // Cache promises to prevent duplicate concurrent network requests
    private _modelCache = new Map<string, Promise<AssetContainer>>();
    private _textureCache = new Map<string, Promise<Texture>>();
    private _hdrCache = new Map<string, Promise<any>>();
    private _soundCache = new Map<string, Promise<Sound>>();

    private constructor() {}

    public static initialize(): AssetManager {
        if (!AssetManager._instance) {
            AssetManager._instance = new AssetManager();
        }
        return AssetManager._instance;
    }

    public static get instance(): AssetManager {
        if (!AssetManager._instance) {
            throw new Error("AssetManager has not been initialized. Call initialize() first.");
        }
        return AssetManager._instance;
    }

    /**
     * Loads a 3D model (GLB, glTF, OBJ, etc.) via AssetContainer and instantiates it into the active scene.
     */
    public async loadModel(
        rootUrl: string, 
        fileName: string, 
        onProgress?: (event: ISceneLoaderProgressEvent) => void
    ): Promise<InstantiatedEntries> {
        const key = `${rootUrl}${fileName}`;
        const scene = SceneManager.instance.scene;
        
        let containerPromise = this._modelCache.get(key);
        
        if (!containerPromise) {
            containerPromise = SceneLoader.LoadAssetContainerAsync(
                rootUrl, 
                fileName, 
                scene, 
                (event: ISceneLoaderProgressEvent) => {
                    if (onProgress) {
                        onProgress(event);
                    }
                }
            ).catch(error => {
                Logger.instance.error(`Failed to load model: ${key}`, error);
                this._modelCache.delete(key);
                throw error;
            });
            
            this._modelCache.set(key, containerPromise);
        }
        
        const container = await containerPromise;
        // Instantiate the model into the CURRENT active scene.
        // This safely clones the model and adds it to the active scene without destroying the cache.
        const entries = container.instantiateModelsToScene(name => name, false, { doNotInstantiate: false });
        return entries;
    }

    /**
     * Completely disposes of a cached model AssetContainer.
     */
    public async disposeModel(rootUrl: string, fileName: string): Promise<void> {
        const key = `${rootUrl}${fileName}`;
        if (!this._modelCache.has(key)) return;
        
        try {
            const container = await this._modelCache.get(key)!;
            container.dispose();
            this._modelCache.delete(key);
            Logger.instance.debug(`Disposed model container: ${key}`);
        } catch (error) {
            Logger.instance.warn(`Error disposing model ${key}`, error);
        }
    }

    /**
     * Loads a standard 2D texture and caches it.
     */
    public async loadTexture(url: string): Promise<Texture> {
        if (this._textureCache.has(url)) {
            return this._textureCache.get(url)!;
        }
        
        const scene = SceneManager.instance.scene;
        const promise = new Promise<Texture>((resolve, reject) => {
            const texture = new Texture(url, scene, undefined, undefined, undefined, 
                () => resolve(texture), 
                (message, exception) => reject(exception || new Error(message))
            );
        });
        
        this._textureCache.set(url, promise);
        return promise;
    }

    /**
     * Loads an environment texture (.env, .hdr, or standard cube) and caches it.
     */
    public async loadHDR(url: string): Promise<any> {
        if (this._hdrCache.has(url)) {
            return this._hdrCache.get(url)!;
        }
        
        const scene = SceneManager.instance.scene;
        const promise = new Promise<any>((resolve, reject) => {
            let texture: any;
            
            // Auto-detect extension for optimal loader
            if (url.toLowerCase().endsWith(".env")) {
                texture = CubeTexture.CreateFromPrefilteredData(url, scene);
                texture.onLoadObservable.addOnce(() => resolve(texture));
            } else if (url.toLowerCase().endsWith(".hdr")) {
                texture = new HDRCubeTexture(url, scene, 512, false, true, false, true, 
                    () => resolve(texture), 
                    () => reject(new Error(`Failed to load HDR: ${url}`))
                );
            } else {
                texture = new CubeTexture(url, scene, undefined, undefined, undefined, 
                    () => resolve(texture), 
                    (message, exception) => reject(exception || new Error(message))
                );
            }
        });
        
        this._hdrCache.set(url, promise);
        return promise;
    }

    /**
     * Loads an audio file and caches it.
     */
    public async loadSound(name: string, url: string): Promise<Sound> {
        const key = url; 
        
        if (this._soundCache.has(key)) {
            return this._soundCache.get(key)!;
        }
        
        const scene = SceneManager.instance.scene;
        const promise = new Promise<Sound>((resolve) => {
            const sound = new Sound(name, url, scene, 
                () => resolve(sound), 
                { loop: false, autoplay: false }
            );
        });
        
        this._soundCache.set(key, promise);
        return promise;
    }

    /**
     * Clears all cached assets. Useful for full scene resets.
     */
    public clearCache(): void {
        this._modelCache.clear();
        this._textureCache.clear();
        this._hdrCache.clear();
        this._soundCache.clear();
    }
}
