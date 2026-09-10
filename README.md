# BugForge

A functional security-learning MVP built with React, Vinext, and TypeScript. The dark workspace opens on the dashboard; `/welcome` contains the product introduction.

## Working features

- Platform-managed ChatGPT sign-in; all learner writes require authenticated identity.
- A seven-step, explicitly self-verified local environment checklist with an intentional skip option.
- Eight short interactive concepts covering HTTP, methods/statuses, headers/cookies/sessions, parameters/forms, JSON/APIs, authorization, browser storage/DOM, and origins.
- Three deterministic built-in labs: HTTP comparison, access control, and reflected-input classification. These simulate HTTP responses using fictional data; they never contact target hosts or execute submitted markup.
- Backend evidence checks, recorded attempts/hints, immutable verification snapshots, and idempotent XP awards.
- Rule-based Forge guidance, visibly labeled as guided mode. No live model is configured.
- Finding creation, editable report drafts, Markdown export, a fictional scope interface, endpoint investigation statuses, and activity/progress views.
- Per-user durable D1 storage with prepared statements and optimistic revisions to prevent lost concurrent writes.

## Start locally

Use Node 22.13 or newer. Install the locked packages with `npm ci`. Run `npm run build`, then apply the generated migration to the local D1 database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mixed_quentin_quire.sql
npm run dev
```

The development server prints its address. Local sign-in is simulated only on loopback and is excluded from production. Hosted identity is supplied by the Sites dispatcher. Do not expose the development server to the internet.

## Verification

- `node tests/engine.test.cjs`: ten focused checks of setup gates, evidence validation, hint penalties, XP idempotency, immutable report evidence, state immutability, and mentor behavior.
- `node tests/api.test.cjs`: eleven integration checks against the local server on port 5173, including anonymous/spoofed auth rejection, revision conflicts, concurrent writes, persistence, credential filtering, and account scope.
- `npx tsc --noEmit`: TypeScript validation.
- `npm run build`: production Worker and assets.

The API test uses only the loopback development account. Its progress is separate from hosted users. The migration was tested locally; production migration application is owned by Sites.

No browser interaction or screenshot QA was requested. WebMCP tools are feature-detected for reading progress and opening a section; execution in a supporting browser was not available for validation.

## Architecture

- `app/application.tsx`: workspace and user flows.
- `app/dashboard.tsx`: dashboard composition.
- `lib/curriculum.ts`: extensible lesson and lab catalog with official resource links.
- `lib/engine.ts`: pure scenario simulation, evidence validation, and progression logic.
- `lib/mentor.ts`: server-side provider interface and honest curated fallback.
- `app/api/state/route.ts`: authenticated, validated action boundary.
- `db/store.ts`: per-user storage adapter; a PostgreSQL-backed adapter can replace D1 for a future hosting architecture.
- `db/schema.ts` and `drizzle/`: schema and immutable migration history.

The local build metadata copier uses bounded file copying for compatibility with restricted Windows workspaces. Site authentication and deployment integration are preserved.

## Deferred capabilities

Per-user Docker containers, real Burp/browser integrations, live model-backed mentoring, screen analysis, advanced lab collections, instructor mode, and open-ended realistic assessments are not implemented. Forge Vision is explicitly off and does not capture any screen. Docker-based apps are installed separately following the official local setup instructions shown in Tools.

Higher progression ranks are planned with future lab collections. The three current labs allow up to 300 XP total; hints lower the available award.

All scope hostnames and program comparisons are fictional examples, not live testing authorization. Real programs require reading and following their actual current policies.
