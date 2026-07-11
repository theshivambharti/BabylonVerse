# Project-Scoped Rules: BabylonVerse Git Integration & Workflow

The following rules dictate how Antigravity agents must interact with the Git repository in this workspace.

## Automatic Git Workflow
After EVERY successfully completed milestone or significant feature, you must automatically perform the following steps:
1. Stage all changes: `git add .`
2. Generate an intelligent commit message based on actual code changes (e.g. "Implemented Material Showcase", "Added HDR Environment Manager").
3. Commit the changes: `git commit -m "..."`. (Skip if no changes exist).
4. Push to origin: `git push origin HEAD`.
If a push fails, stop immediately, display the Git error, and explain the reason. Never continue silently.

## Branch Strategy
- **main**: Used ONLY for stable releases.
- **feature branches**: Create a new feature branch automatically for large modules (e.g., `feature/material-system`, `feature/model-viewer`). Merge only after successful verification.

## Milestone Tagging
Whenever a major milestone is completed, create a Git tag (e.g., `v0.1-material-system`, `v0.2-camera-system`) and push it automatically (`git push origin <tag>`).

## Safety Constraints
- NEVER use `git push --force`.
- NEVER rewrite Git history.
- NEVER delete commits.
- NEVER delete branches automatically.
- NEVER commit secrets or `.env` files.
- NEVER commit build output (e.g., `dist/`) unless explicitly requested.

## Status Report
At the conclusion of every milestone, present a Status Report using the exact format below:
**Current Branch**: <branch-name>
**Latest Commit Hash**: <hash>
**Commit Message**: <message>
**GitHub Remote**: <remote-url>
**Push Status**: <Success/Failed>
**Working Tree Status**: <Clean/Dirty>
**Repository Sync Status**: <In Sync/Ahead/Behind>

## Failure Handling
If ANY Git command fails:
1. Stop immediately.
2. Explain the exact reason.
3. Explain how to fix it.
4. Retry only after receiving confirmation from the user.
5. Never pretend a push succeeded or fabricate Git output.

## Deployment Ready
The repository must remain structurally compatible for deployment on GitHub Actions, Netlify, Vercel, Cloudflare Pages, and Azure Static Web Apps. Ensure no breaking configuration changes are introduced that would violate standard Vite/Node.js build pipelines.
