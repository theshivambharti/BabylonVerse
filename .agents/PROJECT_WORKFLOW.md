# BabylonVerse Project Workflow

Every feature, bugfix, or optimization MUST follow this workflow:

1. **Understand Task**: Read user request, analyze existing architecture.
2. **Plan**: Formulate an implementation plan (`implementation_plan.md`) before writing code.
3. **Implement**: Write modular, strict TypeScript following `CODING_STANDARDS.md`.
4. **Build**: Validate with `npx tsc --noEmit`.
5. **Fix Errors**: Resolve any compiler or linter errors.
6. **Verify**: Ensure asset loading, scene initialization, and FPS are optimal. Never skip verification.
7. **Commit & Push**: Follow `GIT_RULES.md`.
8. **Tag Milestone**: If a milestone is complete, tag it.
9. **Generate Report**: Output a dashboard/status report.
