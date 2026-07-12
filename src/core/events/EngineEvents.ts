import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Light } from "@babylonjs/core/Lights/light";
import { Material } from "@babylonjs/core/Materials/material";

export const EngineEvents = {
    // Studio Lifecycle
    StudioActivated: "StudioActivated",
    StudioDeactivated: "StudioDeactivated",
    
    // Scene Lifecycle
    SceneChanged: "SceneChanged",
    
    // Asset Lifecycle
    AssetLoaded: "AssetLoaded",
    
    // Object Selection
    ObjectSelected: "ObjectSelected",
    ObjectHovered: "ObjectHovered",
    
    // Material
    MaterialSelected: "MaterialSelected",
    
    // Entities
    CameraChanged: "CameraChanged",
    EnvironmentChanged: "EnvironmentChanged",
    LightSelected: "LightSelected",
    
    // UI/State
    ConfigChanged: "ConfigChanged",
    DebugToggled: "DebugToggled"
};

// Payload interfaces for strictly-typed events
export interface IStudioActivatedPayload {
    studioName: string;
}

export interface ISceneChangedPayload {
    scene: Scene;
}

export interface IObjectSelectedPayload {
    mesh: AbstractMesh | null;
}

export interface IMaterialSelectedPayload {
    material: Material | null;
}

export interface ILightSelectedPayload {
    light: Light | null;
}

export interface ICameraChangedPayload {
    camera: Camera | null;
}
