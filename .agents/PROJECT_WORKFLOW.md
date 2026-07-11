# BabylonVerse Project Workflow

GitHub is the single source of truth for the BabylonVerse project. Every feature, bugfix, or optimization MUST follow this workflow automatically without asking for confirmation (unless manual intervention like authentication failures or merge conflicts is required).

## 1. Development & Verification
Before every commit, the following verifications MUST pass:
- TypeScript passes (`npx tsc --noEmit`).
- Production build passes (`npm run build`).
- No console errors.
- No broken imports.
- No missing assets.

**If verification fails:**
1. Do not commit.
2. Fix the issue.
3. Rebuild and verify again.
4. Only commit and push when all checks pass.

## 2. GitHub Automation
Every completed milestone must automatically:
1. Stage all modified files (`git add .`).
2. Generate a professional Conventional Commit message (e.g., `feat:`, `fix:`, `perf:`, `docs:`, `refactor:`, `style:`, `build:`, `release:`).
   - NEVER create meaningless commit messages like: `update`, `changes`, `work`, `fix`.
3. Commit automatically.
4. Push automatically to the `main` branch.
5. Create an annotated Git tag using semantic versioning (e.g., `v0.1.0`, `v0.2-material-showcase`).
6. Push the tag to GitHub (`git push origin <tag>`).

## 3. Documentation Maintenance
Automatically maintain the following files during your workflow:
- `CHANGELOG.md`: Record significant changes under version headers.
- `ROADMAP.md`: Update milestone progress.
- `TODO.md`: Track outstanding tasks.
- `README.md`: Update when architecture or setup commands change.
- Generate professional release notes after each milestone.

## 4. Milestone Summary Report
After each successful push, automatically generate a milestone summary containing:
- Files changed
- Commits created
- Version number
- Build status
- Performance impact
- Remaining work
- Suggested next milestone

Maintain a clean Git history suitable for an open-source production project.
