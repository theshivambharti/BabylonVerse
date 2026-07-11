# Performance Standards

## Targets
- **60 FPS Desktop** (High-end rendering)
- **60 FPS Tablet** (Balanced rendering)
- **45 FPS Mobile minimum** (Optimized rendering)

## Optimization Checklist
- [ ] Limit active meshes and draw calls.
- [ ] Use InstancedMesh or ThinInstances for repeated geometry.
- [ ] Bake lighting where dynamic shadows aren't necessary.
- [ ] Optimize shadow map resolution.
- [ ] Use compressed textures (KTX2/Basis).
- [ ] Ensure materials are not duplicated.
- [ ] Freeze active meshes if they don't move.
- [ ] Use Level of Detail (LOD) for complex models.
