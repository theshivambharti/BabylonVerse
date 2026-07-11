# Security Standards

- NEVER commit secrets, API keys, or credentials.
- NEVER commit `.env` or `.env.local` files.
- Ensure all dependencies are audited regularly (`npm audit`).
- Validate any remote asset URLs to prevent injection.
