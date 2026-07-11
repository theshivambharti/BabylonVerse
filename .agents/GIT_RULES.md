# Git Rules & Automation

## Automation Requirements
After every COMPLETED milestone, you must automatically:
1. `git add .`
2. Generate a professional Conventional Commit message (e.g. `feat:`, `fix:`, `perf:`, `docs:`, `refactor:`, `style:`, `build:`, `release:`).
   - NEVER create meaningless commit messages like: `update`, `changes`, `work`, `fix`.
3. Commit the changes.
4. Push automatically to the `main` branch.
5. Create an annotated Git tag using semantic versioning (v0.x.y).
6. Push the tag to GitHub.

Do NOT ask for confirmation after every milestone. Continue following this workflow automatically unless manual intervention is required.

## Safety & Verification Rules
Before every commit automatically verify:
- TypeScript passes (`npx tsc --noEmit`).
- Production build passes (`npm run build`).
- No console errors.
- No broken imports.
- No missing assets.

If verification fails:
- Do not commit.
- Fix the issue.
- Rebuild.
- Verify again.
- Only then commit and push.

## Commit Style (Conventional Commits)
Maintain a clean Git history suitable for an open-source production project.
- `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `style:`, `build:`, `release:`
