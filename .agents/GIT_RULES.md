# Git Rules & Automation

## Automation Requirements
After every COMPLETED milestone:
1. `git add .`
2. Generate a meaningful commit message (e.g. `feat: Implemented Material Showcase`).
3. Commit and push.
4. If a milestone is completed, create and push a Git tag.

## Safety Rules
- NEVER push broken code or failed builds.
- NEVER commit `node_modules`, `dist`, or `.env`.
- NEVER use `git push --force`.
- Always create feature branches (`feature/materials`, `feature/models`).
- Merge to `main` only after successful verification.

## Commit Style (Conventional Commits)
- `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`
