import { EventBus } from "../events/EventBus";
import { EngineEvents } from "../events/EngineEvents";
import { StudioManager } from "../plugins/StudioManager";

export class NavigationManager {
    private static _instance: NavigationManager;
    private _studioListContainer: HTMLElement | null = null;
    private _toolbarActions: HTMLElement | null = null;

    private readonly _studios = [
        "Home",
        "Models",
        "Materials",
        "Lighting",
        "Cameras",
        "Environment",
        "Physics",
        "Effects",
        "Performance"
    ];

    private constructor() {
        this._studioListContainer = document.getElementById("studio-list");
        this._toolbarActions = document.getElementById("toolbar-actions");
        
        if (!this._studioListContainer) console.error("❌ #studio-list not found");
        if (!this._toolbarActions) console.error("❌ #toolbar-actions not found");
    }

    public static initialize(): NavigationManager {
        if (!NavigationManager._instance) {
            NavigationManager._instance = new NavigationManager();
            NavigationManager._instance._buildNavigation();
            NavigationManager._instance._buildToolbar();
            NavigationManager._instance._setupEventListeners();
        }
        return NavigationManager._instance;
    }

    public static get instance(): NavigationManager {
        if (!NavigationManager._instance) {
            throw new Error("NavigationManager not initialized.");
        }
        return NavigationManager._instance;
    }

    private _buildNavigation(): void {
        if (!this._studioListContainer) return;

        this._studioListContainer.innerHTML = "";

        this._studios.forEach(studioName => {
            const item = document.createElement("div");
            item.className = "nav-item";
            item.textContent = studioName;
            item.dataset.studio = studioName;

            item.onclick = () => {
                StudioManager.instance.activateStudio(studioName);
            };

            this._studioListContainer!.appendChild(item);
        });
    }

    private _buildToolbar(): void {
        if (!this._toolbarActions) return;

        const btnInspector = document.createElement("button");
        btnInspector.textContent = "Inspector (I)";
        btnInspector.onclick = () => {
            const evt = new KeyboardEvent('keydown', { key: 'i', shiftKey: true, ctrlKey: true, altKey: true });
            window.dispatchEvent(evt);
        };

        const btnDebug = document.createElement("button");
        btnDebug.textContent = "Toggle Debug";
        btnDebug.onclick = () => {
            const evt = new CustomEvent("toggle-debug");
            window.dispatchEvent(evt);
            // Assuming config manager will pick this up or we can just call it
            const config = (window as any).BabylonVerseConfig;
            if(config) {
                config.debugMode = !config.debugMode;
            }
        };

        this._toolbarActions.appendChild(btnInspector);
        this._toolbarActions.appendChild(btnDebug);
    }

    private _setupEventListeners(): void {
        EventBus.instance.on(EngineEvents.StudioActivated, (payload: any) => {
            this._updateActiveNav(payload.studioName);
        });
    }

    private _updateActiveNav(activeStudio: string): void {
        if (!this._studioListContainer) return;
        
        const items = this._studioListContainer.querySelectorAll(".nav-item");
        items.forEach(item => {
            if ((item as HTMLElement).dataset.studio === activeStudio) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }

    public showToast(message: string): void {
        const toast = document.getElementById("ui-toast");
        if (toast) {
            toast.textContent = message;
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    }
}

