import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { EngineManager } from "../engine/EngineManager";
import { SceneManager } from "../scene/SceneManager";
import gsap from "gsap";

export class CameraManager {
    private static _instance: CameraManager;
    private _activeCamera: ArcRotateCamera | null = null;
    
    // Store original position for reset
    private _defaultRadius: number = 10;
    private _defaultAlpha: number = Math.PI / 4;
    private _defaultBeta: number = Math.PI / 3;
    private _defaultTarget: Vector3 = Vector3.Zero();

    private constructor() {}

    public static initialize(): CameraManager {
        if (!CameraManager._instance) {
            CameraManager._instance = new CameraManager();
        }
        return CameraManager._instance;
    }

    public static get instance(): CameraManager {
        if (!CameraManager._instance) {
            throw new Error("CameraManager has not been initialized. Call initialize() first.");
        }
        return CameraManager._instance;
    }

    public createArcRotateCamera(name: string = "MainCamera"): ArcRotateCamera {
        const scene = SceneManager.instance.scene;
        const canvas = EngineManager.instance.canvas;

        if (this._activeCamera) {
            this._activeCamera.dispose();
        }

        // Parameters: name, alpha, beta, radius, target, scene
        this._activeCamera = new ArcRotateCamera(
            name,
            this._defaultAlpha,
            this._defaultBeta,
            this._defaultRadius,
            this._defaultTarget,
            scene
        );

        // Configure default interactive behaviors
        this._activeCamera.attachControl(canvas, true);
        
        // Polished defaults for professional UX
        this._activeCamera.wheelPrecision = 50;
        this._activeCamera.minZ = 0.1;
        this._activeCamera.maxZ = 1000;
        this._activeCamera.lowerRadiusLimit = 1;
        this._activeCamera.upperRadiusLimit = 500;
        // Restrict camera from going completely underground by default
        this._activeCamera.upperBetaLimit = Math.PI / 2 + 0.1; 

        return this._activeCamera;
    }

    public get activeCamera(): ArcRotateCamera {
        if (!this._activeCamera) {
            throw new Error("No active camera. Call createArcRotateCamera() first.");
        }
        return this._activeCamera;
    }
    
    /**
     * Smoothly animates the camera to focus on a specific mesh using GSAP.
     */
    public focusOn(mesh: AbstractMesh): void {
        if (!this._activeCamera) return;
        
        // Calculate the bounding center of the mesh
        const boundingInfo = mesh.getBoundingInfo();
        const center = boundingInfo.boundingSphere.centerWorld;
        const radius = boundingInfo.boundingSphere.radiusWorld;
        
        // Target radius to comfortably fit the object
        const targetRadius = Math.max(radius * 3, this._activeCamera.lowerRadiusLimit || 1);
        
        // Animate Target
        gsap.to(this._activeCamera.target, {
            x: center.x,
            y: center.y,
            z: center.z,
            duration: 1.5,
            ease: "power2.inOut"
        });
        
        // Animate Radius
        gsap.to(this._activeCamera, {
            radius: targetRadius,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }
    
    /**
     * Resets the camera to its default viewing angle.
     */
    public reset(): void {
        if (!this._activeCamera) return;
        
        gsap.to(this._activeCamera.target, {
            x: this._defaultTarget.x,
            y: this._defaultTarget.y,
            z: this._defaultTarget.z,
            duration: 1.5,
            ease: "power2.inOut"
        });
        
        gsap.to(this._activeCamera, {
            radius: this._defaultRadius,
            alpha: this._defaultAlpha,
            beta: this._defaultBeta,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }
}
