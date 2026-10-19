# BUGFORGE standalone deployment

This branch introduces a **browser-based demo session** that does not use ChatGPT authentication. It is intended for portfolio demonstration, not a production user-account system.

## Session behavior

Selecting **Sign in** creates a fresh random guest identity stored in a signed, HTTP-only cookie. The API validates the HMAC signature on every request before using that identity to access the D1 database. Clearing browser cookies loses access to that guest's saved progress. This does not provide password recovery, account transfer, email verification, or durable user accounts.

**Security requirement:** Keep `SESSION_SECRET` private. Set a random secret with at least 32 characters using the Cloudflare deployment secret manager, for example:

```bash
npx wrangler secret put SESSION_SECRET --config dist/server/wrangler.json
```

Do not commit a real secret to Git.

## Local setup

1. Install Node.js 22.13+ and run `npm ci`.
2. Configure `SESSION_SECRET` in the local Worker development environment and ensure the D1 database binding named `DB` exists.
3. Run `npm run build`.
4. Apply `drizzle/0000_mixed_quentin_quire.sql` to the local D1 database using the generated Worker config.
5. Run `npm run dev`.

The existing build generates `dist/server/wrangler.json`. Inspect the resulting config to confirm Worker entrypoint and D1 bindings before deploying. A D1 database for the production environment must be created and migrations applied before the site is accessible.

## Verification checklist

- Open the homepage without any ChatGPT identity headers.
- Click Sign in and confirm a session cookie is created.
- Complete a simulated lab, refresh the page, and confirm progress persists.
- Clear the cookie and confirm the previous session cannot be impersonated.
- Test sign-out and confirm API requests without a valid cookie receive 401.
- Run `node tests/engine.test.cjs`, `node tests/api.test.cjs`, `npx tsc --noEmit`, and `npm run build`.

**Important:** The prior API tests may assume the former platform authentication flow and may need updating. This migration has not yet been built or integration-tested. Do not deploy publicly before verifying configuration, tests, and cookie behavior.

For permanent accounts, implement an established authentication provider and account recovery instead of relying on anonymous demo sessions.
