import { NavigationManager } from "../core/app/NavigationManager";
import { IShowcase } from "../core/interfaces/IShowcase";
import { SceneManager } from "../core/scene/SceneManager";
import { Scene } from "@babylonjs/core/scene";
import { CameraManager } from "../core/camera/CameraManager";

export class HomeShowcase implements IShowcase {
    private _scene: Scene | null = null;
    private _container: HTMLElement | null = null;

    public async load(): Promise<void> {
        this._scene = SceneManager.instance.createScene();
        SceneManager.instance.setActiveScene(this._scene);
        
        // Simple fixed camera since it's just a UI background
        CameraManager.instance.createArcRotateCamera("HomeCamera");
        
        this._buildHTML();
    }

    public unload(): void {
        if (this._container) {
            this._container.remove();
            this._container = null;
        }
        if (this._scene) {
            this._scene.dispose();
            this._scene = null;
        }
    }

    private _buildHTML(): void {
        const uiLayer = document.getElementById("ui-layer");
        if (!uiLayer) return;

        this._container = document.createElement("div");
        this._container.className = "home-container";

        const header = document.createElement("div");
        header.className = "home-header";
        
        const title = document.createElement("h1");
        title.className = "home-title";
        title.textContent = "BabylonVerse";

        const subtitle = document.createElement("p");
        subtitle.className = "home-subtitle";
        subtitle.textContent = "Professional Babylon.js Showcase";

        header.appendChild(title);
        header.appendChild(subtitle);
        this._container.appendChild(header);

        const grid = document.createElement("div");
        grid.className = "cards-grid";

        const modules = [
            "Materials", "Lighting", "Cameras", "Models", 
            "Physics", "Environment", "Effects", "Performance"
        ];

        modules.forEach(mod => {
            const card = document.createElement("div");
            card.className = "showcase-card";
            
            const cardTitle = document.createElement("h3");
            cardTitle.textContent = mod;
            card.appendChild(cardTitle);

            card.onclick = () => {
                NavigationManager.instance.navigateTo(mod);
            };

            grid.appendChild(card);
        });

        this._container.appendChild(grid);
        uiLayer.appendChild(this._container);
    }
}
