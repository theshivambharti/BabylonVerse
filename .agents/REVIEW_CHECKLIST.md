# Code Review Checklist

Before every commit, verify:
- [ ] TypeScript compilation passes (`tsc --noEmit`).
- [ ] Vite build succeeds (`npm run build`).
- [ ] Asset loading behaves correctly.
- [ ] Scene initializes without black screens.
- [ ] Console is free of errors and warnings.
- [ ] FPS remains stable at 60 on Desktop.
- [ ] Memory leaks do not occur during scene disposal.
- [ ] No broken imports.
- [ ] All required assets exist and pathing is network-safe.
