# Architecture

BabylonVerse uses a modular, decoupled architecture where each showcase runs in its own isolated scene.

- **SceneManager**: Handles active scene creation, setting, and rendering loop.
- **ShowcaseManager**: Handles module routing and loads/unloads modules.
- **AppManager**: Bootstraps the application.
- **NavigationManager**: Handles HTML UI navigation.
