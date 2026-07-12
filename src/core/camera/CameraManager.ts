import { Camera } from "@babylonjs/core/Cameras/camera";
import { TargetCamera } from "@babylonjs/core/Cameras/targetCamera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { FlyCamera } from "@babylonjs/core/Cameras/flyCamera";
import { DeviceOrientationCamera } from "@babylonjs/core/Cameras/deviceOrientationCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { EngineManager } from "../engine/EngineManager";
import { SceneManager } from "../scene/SceneManager";
import gsap from "gsap";

export class CameraManager {
    private static _instance: CameraManager;
    private _activeCamera: Camera | null = null;
    
    // Store original position for reset (ArcRotate specifics as default)
    private _defaultRadius: number = 10;
    private _defaultAlpha: number = Math.PI / 4;
    private _defaultBeta: number = Math.PI / 3;
    private _defaultTarget: Vector3 = Vector3.Zero();
    private _defaultPosition: Vector3 = new Vector3(0, 5, -10);

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

    public get activeCamera(): Camera {
        if (!this._activeCamera) {
            throw new Error("No active camera.");
        }
        return this._activeCamera;
    }

    public setActiveCamera(camera: Camera): void {
        this._activeCamera = camera;
        const scene = SceneManager.instance.scene;
        scene.activeCamera = camera;
    }

    private _attach(camera: Camera): void {
        const canvas = EngineManager.instance.canvas;
        camera.attachControl(canvas, true);
    }

    public createArcRotateCamera(name: string = "ArcRotateCamera"): ArcRotateCamera {
        const scene = SceneManager.instance.scene;
        if (this._activeCamera) this._activeCamera.dispose();

        const camera = new ArcRotateCamera(name, this._defaultAlpha, this._defaultBeta, this._defaultRadius, this._defaultTarget, scene);
        this._attach(camera);
        
        camera.wheelPrecision = 50;
        camera.minZ = 0.1;
        camera.maxZ = 1000;
        camera.lowerRadiusLimit = 1;
        camera.upperRadiusLimit = 500;
        camera.upperBetaLimit = Math.PI / 2 + 0.1; 

        this.setActiveCamera(camera);
        return camera;
    }

    public createUniversalCamera(name: string = "UniversalCamera"): UniversalCamera {
        const scene = SceneManager.instance.scene;
        if (this._activeCamera) this._activeCamera.dispose();

        const camera = new UniversalCamera(name, this._defaultPosition, scene);
        camera.setTarget(this._defaultTarget);
        this._attach(camera);
        
        camera.speed = 0.5;
        camera.minZ = 0.1;

        this.setActiveCamera(camera);
        return camera;
    }

    public createFreeCamera(name: string = "FreeCamera"): FreeCamera {
        const scene = SceneManager.instance.scene;
        if (this._activeCamera) this._activeCamera.dispose();

        const camera = new FreeCamera(name, this._defaultPosition, scene);
        camera.setTarget(this._defaultTarget);
        this._attach(camera);
        
        camera.speed = 0.5;

        this.setActiveCamera(camera);
        return camera;
    }

    public createFollowCamera(name: string = "FollowCamera", lockedTarget?: AbstractMesh): FollowCamera {
        const scene = SceneManager.instance.scene;
        if (this._activeCamera) this._activeCamera.dispose();

        const camera = new FollowCamera(name, this._defaultPosition, scene);
        camera.radius = 10;
        camera.heightOffset = 4;
        camera.rotationOffset = 180;
        camera.cameraAcceleration = 0.05;
        camera.maxCameraSpeed = 10;
        
        if (lockedTarget) {
            camera.lockedTarget = lockedTarget;
        }

        this._attach(camera);
        this.setActiveCamera(camera);
        return camera;
    }

    public createFlyCamera(name: string = "FlyCamera"): FlyCamera {
        const scene = SceneManager.instance.scene;
        if (this._activeCamera) this._activeCamera.dispose();

        const camera = new FlyCamera(name, this._defaultPosition, scene);
        camera.setTarget(this._defaultTarget);
        
        camera.rollCorrect = 10; // Auto roll correction
        camera.bankedTurn = true;
        camera.bankedTurnMultiplier = 1;
        
        this._attach(camera);
        this.setActiveCamera(camera);
        return camera;
    }

    public createDeviceOrientationCamera(name: string = "DeviceOrientationCamera"): DeviceOrientationCamera {
        const scene = SceneManager.instance.scene;
        if (this._activeCamera) this._activeCamera.dispose();

        const camera = new DeviceOrientationCamera(name, this._defaultPosition, scene);
        camera.setTarget(this._defaultTarget);
        this._attach(camera);
        
        this.setActiveCamera(camera);
        return camera;
    }
    
    /**
     * Smoothly animates the camera to focus on a specific mesh using GSAP.
     */
    public focusOn(mesh: AbstractMesh): void {
        if (!this._activeCamera) return;
        
        const boundingInfo = mesh.getBoundingInfo();
        const center = boundingInfo.boundingSphere.centerWorld;
        const radius = boundingInfo.boundingSphere.radiusWorld;
        
        if (this._activeCamera instanceof ArcRotateCamera) {
            const arcCam = this._activeCamera as ArcRotateCamera;
            const targetRadius = Math.max(radius * 3, arcCam.lowerRadiusLimit || 1);
            
            gsap.to(arcCam.target, { x: center.x, y: center.y, z: center.z, duration: 1.5, ease: "power2.inOut" });
            gsap.to(arcCam, { radius: targetRadius, duration: 1.5, ease: "power2.inOut" });
        } else if (this._activeCamera instanceof TargetCamera) {
            const tCam = this._activeCamera as TargetCamera;
            
            // Fly to a point slightly offset from the target
            const dir = tCam.position.subtract(center).normalize();
            const targetPos = center.add(dir.scale(radius * 4));
            
            gsap.to(tCam.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.5, ease: "power2.inOut" });
            gsap.to(tCam.target, { x: center.x, y: center.y, z: center.z, duration: 1.5, ease: "power2.inOut" });
        }
    }
    
    /**
     * Resets the camera to its default viewing angle.
     */
    public reset(): void {
        if (!this._activeCamera) return;
        
        if (this._activeCamera instanceof ArcRotateCamera) {
            const arcCam = this._activeCamera as ArcRotateCamera;
            gsap.to(arcCam.target, { x: this._defaultTarget.x, y: this._defaultTarget.y, z: this._defaultTarget.z, duration: 1.5, ease: "power2.inOut" });
            gsap.to(arcCam, { radius: this._defaultRadius, alpha: this._defaultAlpha, beta: this._defaultBeta, duration: 1.5, ease: "power2.inOut" });
        } else if (this._activeCamera instanceof TargetCamera) {
            const tCam = this._activeCamera as TargetCamera;
            gsap.to(tCam.position, { x: this._defaultPosition.x, y: this._defaultPosition.y, z: this._defaultPosition.z, duration: 1.5, ease: "power2.inOut" });
            gsap.to(tCam.target, { x: this._defaultTarget.x, y: this._defaultTarget.y, z: this._defaultTarget.z, duration: 1.5, ease: "power2.inOut" });
        }
    }

    /**
     * Clears camera references when a scene is disposed.
     */
    public clearSceneContext(): void {
        this._activeCamera = null;
    }
}
