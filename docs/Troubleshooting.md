# Troubleshooting

- **Black screen on load?** Ensure `SceneManager.instance.setActiveScene` was called.
- **Memory Leak?** Ensure `scene.dispose()` is called in `unload()`.
