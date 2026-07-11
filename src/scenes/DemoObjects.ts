import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { SceneManager } from "../core/scene/SceneManager";
import { MaterialManager } from "../core/materials/MaterialManager";
import { LightingManager } from "../core/lighting/LightingManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class DemoObjects {
    /**
     * Generates a professionally arranged gallery of 3D primitives to showcase
     * the capabilities of the MaterialManager and physical lighting environment.
     */
    public static createShowcase(): void {
        const scene = SceneManager.instance.scene;
        const mm = MaterialManager.instance;
        const lm = LightingManager.instance;
        
        // Grab the shadow generator configured on the sun
        const shadowGen = lm.getShadowGenerator("sunLight");

        // Define our materials array to map to shapes
        const materials = [
            mm.createGold("gold"),
            mm.createChrome("chrome"),
            mm.createGlass("glass"),
            mm.createPlastic("plastic", new Color3(0.8, 0.1, 0.1)),
            mm.createRubber("rubber"),
            mm.createConcrete("concrete"),
            mm.createWood("wood"),
            mm.createEmissiveNeon("neon", new Color3(0.2, 0.8, 1.0))
        ];

        // Arrange in a beautiful semi-circle gallery setup
        const radius = 10;
        const count = materials.length;
        
        for (let i = 0; i < count; i++) {
            // Distribute evenly in a wide arc facing the camera
            const angle = (i / (count - 1)) * Math.PI - (Math.PI / 2);
            
            let mesh: Mesh;
            const shapeIndex = i % 5; // Cycle through 5 required shapes
            
            switch(shapeIndex) {
                case 0:
                    mesh = MeshBuilder.CreateSphere(`sphere_${i}`, { diameter: 2, segments: 64 }, scene);
                    mesh.position.y = 1;
                    break;
                case 1:
                    mesh = MeshBuilder.CreateBox(`box_${i}`, { size: 2 }, scene);
                    mesh.position.y = 1;
                    break;
                case 2:
                    mesh = MeshBuilder.CreateCylinder(`cylinder_${i}`, { height: 2, diameter: 2, tessellation: 64 }, scene);
                    mesh.position.y = 1;
                    break;
                case 3:
                    mesh = MeshBuilder.CreateTorus(`torus_${i}`, { diameter: 2, thickness: 0.6, tessellation: 64 }, scene);
                    mesh.position.y = 1;
                    break;
                case 4:
                default:
                    mesh = MeshBuilder.CreatePlane(`plane_${i}`, { size: 2.5 }, scene);
                    mesh.position.y = 1.25;
                    materials[i].backFaceCulling = false; // Planes should be visible from behind
                    break;
            }

            // Position based on arc
            mesh.position.x = Math.sin(angle) * radius;
            mesh.position.z = Math.cos(angle) * radius;
            
            // Reorient the plane to gracefully face the origin/camera
            if (shapeIndex === 4) {
                mesh.lookAt(new Vector3(0, mesh.position.y, 0));
                // Rotate 180 so the front faces origin (Babylon planes face -Z usually)
                mesh.rotation.y += Math.PI; 
            }

            // Assign Material
            mesh.material = materials[i];
            
            // Cast Shadows
            if (shadowGen) {
                shadowGen.addShadowCaster(mesh);
            }
        }
    }
}
