import { SceneManager } from "../scene/SceneManager";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";

export class GUIManager {
    private static _instance: GUIManager;
    private _fullscreenUIs: Map<string, AdvancedDynamicTexture> = new Map();

    private constructor() {}

    public static initialize(): GUIManager {
        if (!GUIManager._instance) {
            GUIManager._instance = new GUIManager();
        }
        return GUIManager._instance;
    }

    public static get instance(): GUIManager {
        if (!GUIManager._instance) {
            throw new Error("GUIManager has not been initialized. Call initialize() first.");
        }
        return GUIManager._instance;
    }

    /**
     * Creates or retrieves a fullscreen GUI layer attached to the active scene.
     */
    public createFullscreenUI(name: string): AdvancedDynamicTexture {
        if (this._fullscreenUIs.has(name)) {
            return this._fullscreenUIs.get(name)!;
        }

        const scene = SceneManager.instance.scene;
        // Foreground UI overlay
        const ui = AdvancedDynamicTexture.CreateFullscreenUI(name, true, scene);
        this._fullscreenUIs.set(name, ui);
        
        return ui;
    }

    /**
     * Retrieves an existing fullscreen UI by name.
     */
    public getFullscreenUI(name: string): AdvancedDynamicTexture | undefined {
        return this._fullscreenUIs.get(name);
    }

    /**
     * Factory method for creating an organizational StackPanel.
     */
    public createStackPanel(name: string, isVertical: boolean = true): StackPanel {
        const panel = new StackPanel(name);
        panel.isVertical = isVertical;
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        return panel;
    }

    /**
     * Factory method for creating a modular UI background/container rectangle.
     */
    public createRectangle(name: string): Rectangle {
        const rect = new Rectangle(name);
        rect.background = "rgba(0, 0, 0, 0.7)";
        rect.color = "white";
        rect.thickness = 1;
        rect.cornerRadius = 8;
        return rect;
    }

    /**
     * Factory method for a modular Button with default modern styling and hover states.
     */
    public createButton(name: string, text: string): Button {
        const button = Button.CreateSimpleButton(name, text);
        button.width = "150px";
        button.height = "40px";
        button.color = "white";
        button.cornerRadius = 4;
        button.background = "#2a2a2a";
        button.thickness = 1;
        button.fontFamily = "sans-serif";
        
        // Setup modern interactive hover effects
        button.onPointerEnterObservable.add(() => {
            button.background = "#3a3a3a";
            button.color = "#ffffff";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "#2a2a2a";
            button.color = "white";
        });

        return button;
    }

    /**
     * Factory method for creating a TextBlock (Label) with standard styling.
     */
    public createLabel(name: string, text: string): TextBlock {
        const label = new TextBlock(name, text);
        label.color = "white";
        label.fontSize = 16;
        label.fontFamily = "sans-serif";
        label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        label.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        return label;
    }
}
