# BabylonVerse

BabylonVerse is a production-grade, open-source 3D engine built on top of Babylon.js.
It is designed as a modular, decoupled framework for creating high-end, interactive 3D product showrooms, architectural visualizations, and immersive web experiences.

## Features
- **Modular Architecture**: Isolated showcases with dedicated memory and scene management.
- **PBR Materials**: Fully physically-based rendering pipelines out of the box.
- **Dynamic Lighting**: Hemispheric, Directional, and HDR Environment lighting integration.
- **High Performance**: Memory-leak safe routing, optimized for 60 FPS on Desktop and Tablet.
- **Modern UI**: Integrated HTML-over-Canvas HUD with GSAP animations.

## Architecture
See `docs/Architecture.md` for a complete technical breakdown of the singleton manager pattern used throughout the engine (e.g. `SceneManager`, `LightingManager`, `CameraManager`).

## Installation

```bash
git clone https://github.com/theshivambharti/BabylonVerse.git
cd BabylonVerse
npm install
npm run dev
```

## Development
- Use `npm run build` to validate the TypeScript compilation and generate the production `dist/` directory.
- Refer to `docs/CodingGuide.md` and `.agents/CODING_STANDARDS.md` for contribution standards.

## Folder Structure
- `src/core/`: Engine managers.
- `src/showcases/`: Isolated module implementations.
- `src/assets/`: Textures, HDR, GLB models.
- `docs/`: Technical documentation.

## Roadmap
See `DASHBOARD.md` and `docs/Roadmap.md` for the current state of the project.

## Contributing
Please see `CONTRIBUTING.md`. AI Agents must also review `.agents/CONTRIBUTING_AI.md`.

## License
MIT License. See `LICENSE` for details.
