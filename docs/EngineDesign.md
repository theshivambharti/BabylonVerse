# Engine Design

The engine wraps Babylon.js primitives and provides a singleton manager approach to decoupled systems.
The render loop natively renders `SceneManager.instance.activeScene`.
