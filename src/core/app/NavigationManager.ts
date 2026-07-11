import { ShowcaseManager } from "../scene/ShowcaseManager";

export class NavigationManager {
    private static _instance: NavigationManager;
    private _uiLayer: HTMLElement | null = null;
    private _currentShowcaseLabel: HTMLElement | null = null;
    private _backButton: HTMLElement | null = null;

    private constructor() {
        this._uiLayer = document.getElementById("ui-layer");
        if (!this._uiLayer) {
            console.error("❌ #ui-layer not found in DOM");
        }
    }

    public static initialize(): NavigationManager {
        if (!NavigationManager._instance) {
            NavigationManager._instance = new NavigationManager();
            NavigationManager._instance._buildTopBar();
            NavigationManager._instance._buildToastContainer();
        }
        return NavigationManager._instance;
    }

    public static get instance(): NavigationManager {
        if (!NavigationManager._instance) {
            throw new Error("NavigationManager not initialized. Call initialize() first.");
        }
        return NavigationManager._instance;
    }

    public navigateTo(showcaseName: string): void {
        console.log(`🧭 Navigating to: ${showcaseName}`);
        
        // Update top bar title
        if (this._currentShowcaseLabel) {
            this._currentShowcaseLabel.textContent = showcaseName;
        }

        // Manage Back Button visibility
        if (this._backButton) {
            if (showcaseName === "Home") {
                this._backButton.style.display = "none";
            } else {
                this._backButton.style.display = "block";
            }
        }

        // Clear current HTML UI content (except Top Bar and Toast)
        this._clearHomeContent();

        // Let ShowcaseManager handle 3D scene changes
        ShowcaseManager.instance.loadShowcase(showcaseName);
    }

    public showComingSoon(moduleName: string): void {
        const toast = document.getElementById("ui-toast");
        if (toast) {
            toast.textContent = `${moduleName}: Coming Soon`;
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    }

    private _buildTopBar(): void {
        if (!this._uiLayer) return;

        const navBar = document.createElement("div");
        navBar.className = "nav-bar";

        // Left: Logo and Back Button
        const navLeft = document.createElement("div");
        navLeft.className = "nav-left";
        
        this._backButton = document.createElement("button");
        this._backButton.className = "nav-btn back-btn";
        this._backButton.textContent = "← Back";
        this._backButton.style.display = "none";
        this._backButton.onclick = () => {
            this.navigateTo("Home");
        };

        const logo = document.createElement("div");
        logo.className = "nav-logo";
        logo.textContent = "BabylonVerse";
        
        navLeft.appendChild(this._backButton);
        navLeft.appendChild(logo);

        // Center: Showcase Name
        const navCenter = document.createElement("div");
        navCenter.className = "nav-center";
        this._currentShowcaseLabel = document.createElement("span");
        this._currentShowcaseLabel.textContent = "Home";
        navCenter.appendChild(this._currentShowcaseLabel);

        // Right: Buttons
        const navRight = document.createElement("div");
        navRight.className = "nav-right";

        const btnInspector = document.createElement("button");
        btnInspector.className = "nav-btn";
        btnInspector.textContent = "Inspector (I)";
        btnInspector.onclick = () => {
            const evt = new KeyboardEvent('keydown', { key: 'I', shiftKey: true, ctrlKey: true, altKey: true });
            document.dispatchEvent(evt);
        };

        const btnReset = document.createElement("button");
        btnReset.className = "nav-btn";
        btnReset.textContent = "Reset Camera (R)";
        btnReset.onclick = () => {
            const evt = new KeyboardEvent('keydown', { key: 'r' });
            window.dispatchEvent(evt);
        };

        navRight.appendChild(btnInspector);
        navRight.appendChild(btnReset);

        navBar.appendChild(navLeft);
        navBar.appendChild(navCenter);
        navBar.appendChild(navRight);

        this._uiLayer.appendChild(navBar);
    }

    private _buildToastContainer(): void {
        if (!this._uiLayer) return;
        const toast = document.createElement("div");
        toast.id = "ui-toast";
        toast.className = "toast";
        this._uiLayer.appendChild(toast);
    }

    private _clearHomeContent(): void {
        if (!this._uiLayer) return;
        const homeContainer = this._uiLayer.querySelector(".home-container");
        if (homeContainer) {
            homeContainer.remove();
        }
    }
}
