import { GUIManager } from "../gui/GUIManager";
import { InteractionManager } from "./InteractionManager";
import { EnvironmentManager } from "../environment/EnvironmentManager";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

// @ts-ignore
import envStudioUrl from "../../assets/hdr/environment.env?url";
// @ts-ignore
import envOutdoorUrl from "../../assets/hdr/outdoor.env?url";
// @ts-ignore
import envNightUrl from "../../assets/hdr/night.env?url";

export class ShowcaseUI {
    private static _instance: ShowcaseUI;

    private _infoPanel: Rectangle | null = null;
    private _nameLabel: TextBlock | null = null;
    private _matLabel: TextBlock | null = null;
    private _typeLabel: TextBlock | null = null;

    private constructor() {}

    public static initialize(): ShowcaseUI {
        if (!ShowcaseUI._instance) {
            ShowcaseUI._instance = new ShowcaseUI();
            ShowcaseUI._instance._buildUI();
            ShowcaseUI._instance._setupSubscriptions();
        }
        return ShowcaseUI._instance;
    }

    private _buildUI(): void {
        const gui = GUIManager.instance;
        const ui = gui.createFullscreenUI("ShowcaseUI");

        // --- INFO PANEL (Hidden by default) ---
        this._infoPanel = gui.createRectangle("InfoPanel");
        this._infoPanel.width = "250px";
        this._infoPanel.height = "120px";
        this._infoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._infoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._infoPanel.left = "20px";
        this._infoPanel.top = "-20px";
        this._infoPanel.isVisible = false;

        const infoStack = gui.createStackPanel("InfoStack", true);
        this._infoPanel.addControl(infoStack);

        this._nameLabel = gui.createLabel("NameLabel", "Name: -");
        this._nameLabel.height = "30px";
        this._nameLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._nameLabel.paddingLeft = "10px";
        infoStack.addControl(this._nameLabel);

        this._matLabel = gui.createLabel("MatLabel", "Material: -");
        this._matLabel.height = "30px";
        this._matLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._matLabel.paddingLeft = "10px";
        infoStack.addControl(this._matLabel);

        this._typeLabel = gui.createLabel("TypeLabel", "Type: Mesh");
        this._typeLabel.height = "30px";
        this._typeLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._typeLabel.paddingLeft = "10px";
        infoStack.addControl(this._typeLabel);

        ui.addControl(this._infoPanel);

        // --- ENVIRONMENT SWITCHER ---
        const envPanel = gui.createStackPanel("EnvSwitcher", false); // Horizontal
        envPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        envPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        envPanel.top = "20px";
        envPanel.paddingRight = "20px";
        envPanel.height = "50px";

        const btnStudio = gui.createButton("BtnStudio", "Studio");
        btnStudio.onPointerUpObservable.add(() => {
            EnvironmentManager.instance.setupHDR(envStudioUrl, true);
        });
        
        const btnOutdoor = gui.createButton("BtnOutdoor", "Outdoor");
        btnOutdoor.onPointerUpObservable.add(() => {
            EnvironmentManager.instance.setupHDR(envOutdoorUrl, true);
        });

        const btnNight = gui.createButton("BtnNight", "Night");
        btnNight.onPointerUpObservable.add(() => {
            EnvironmentManager.instance.setupHDR(envNightUrl, true);
        });

        envPanel.addControl(btnStudio);
        envPanel.addControl(btnOutdoor);
        envPanel.addControl(btnNight);

        ui.addControl(envPanel);
        
        // --- INSTRUCTIONS ---
        const instrLabel = gui.createLabel("InstrLabel", "F: Focus | R: Reset | I: Inspector");
        instrLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        instrLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        instrLabel.top = "-20px";
        instrLabel.height = "30px";
        ui.addControl(instrLabel);
    }

    private _setupSubscriptions(): void {
        InteractionManager.instance.onMeshSelected.add((mesh: AbstractMesh | null) => {
            if (!this._infoPanel || !this._nameLabel || !this._matLabel || !this._typeLabel) return;

            if (mesh) {
                this._nameLabel.text = `Name: ${mesh.name}`;
                this._matLabel.text = `Material: ${mesh.material ? mesh.material.name : "None"}`;
                this._typeLabel.text = `Vertices: ${mesh.getTotalVertices()}`;
                this._infoPanel.isVisible = true;
            } else {
                this._infoPanel.isVisible = false;
            }
        });
    }
}
