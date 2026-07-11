# Babylon.js Rules

1. **Always dispose meshes**: Prevent memory leaks during scene transitions.
2. **Always dispose textures**: Free GPU memory when textures are no longer used.
3. **Always dispose materials**: Ensure materials are cleared from memory.
4. **Cache HDR**: Only load environment textures once and reuse them.
5. **Cache models**: Keep loaded GLB models in memory if frequently reused.
6. **Lazy loading**: Load assets only when required.
7. **Texture compression**: Use Basis or KTX2 for production.
8. **60 FPS target**: Optimize rendering pipeline to maintain 60 FPS.
9. **Modular rendering**: Separate rendering logic from business logic.
10. **Independent managers**: `SceneManager`, `CameraManager`, etc., must not tightly couple.
