# Changelog

All notable changes to this project will be documented in this file.

## [v0.3.1] - 2026-07-12
### Fixed & Polished
- Adjusted object spacing in Lighting Showcase for better composition.
- Increased camera focus radius to prevent clipping on focus.
- Tuned ShadowGenerator blur kernel from 32 to 64 and tweaked darkness.
- Boosted environment intensity to 1.2 for more vibrant PBR reflections.
- Completed full production build verification pass.

## [v0.3.0] - 2026-07-12
### Added
- Complete Lighting Studio showcase (`LightingShowcase.ts`)
- Interactive Gizmos to manipulate Hemispheric, Directional, Point, and Spot lights
- Real-time inspector to control lighting intensity, color, and shadows
- GSAP camera integration to dynamically focus on selected lights
- Enhanced `LightingManager` with dynamic shadow and color toggling utilities

## [v0.2-material-showcase] - 2026-07-12
### Added
- Professional 3x4 grid gallery layout in `MaterialsShowcase.ts`
- Glassmorphism translucent UI panels in `style.css`
- Advanced PBR live controls (Alpha, Metallic, Roughness, Clear Coat, Anisotropy, Reflectivity, Ambient, Emissive, Tint)
- Concrete and Paint materials in `MaterialManager.ts`
- Smooth camera animations using GSAP
- High-contrast premium environment lighting

## [v0.1-project-foundation] - 2026-07-12
### Added
- Standardized GitHub workflow
- Production-ready AI agent documentation (`AGENTS.md`, `PROJECT_WORKFLOW.md`, `GIT_RULES.md`)
- Optimized `vite.config.ts` and `package.json` for massive asset bundling without memory leaks
