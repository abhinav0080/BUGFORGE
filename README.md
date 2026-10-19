# BUGFORGE

BUGFORGE is an interactive web application for learning foundational web security concepts through controlled, fictional exercises. Learners can inspect simulated HTTP responses, compare access-control behavior, document findings, and track progress across sessions.

The application uses React and TypeScript for its interface, server-side API routes for exercise validation, and Cloudflare D1 for per-user persistence.

## Features

- **Structured learning:** Eight concise lessons covering HTTP, sessions, APIs, authorization, browser behavior, and related concepts.
- **Interactive exercises:** Three self-contained labs for HTTP request comparison, access-control analysis, and reflected-input classification.
- **Evidence-based completion:** Exercise submissions are checked against recorded interactions before credit is awarded. Verified evidence is retained for reports.
- **Progress tracking:** Account-specific progress, history, hints, and completed labs persist in D1.
- **Findings and reports:** Create findings, edit report drafts, and export Markdown.
- **Guided help:** A rule-based mentor responds to common learning questions. This release does not use a live AI model.
- **Consistency and safety:** Revision checks help prevent conflicting writes, while input validation and authenticated API access protect application state.

All exercise endpoints, accounts, and responses are simulated. BUGFORGE does not send requests to third-party targets or execute injected scripts.

## Technology

- React, TypeScript, Vinext, and Vite
- Server-side API routes
- Cloudflare Workers and D1
- Drizzle ORM
- Node.js test tooling

## Run locally

**Requirements:** Node.js 22.13 or later and npm.

```bash
npm ci
npm run build
```

Initialize the local D1 database:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mixed_quentin_quire.sql
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. Local sign-in is simulated on loopback only; the hosted application relies on platform-provided authentication. Do not expose the local development server to the public internet.

## Project structure

| Path | Responsibility |
| --- | --- |
| `app/application.tsx` | User flows and workspace |
| `app/dashboard.tsx` | Dashboard presentation |
| `app/api/state/route.ts` | Authenticated API, input validation, and state updates |
| `lib/curriculum.ts` | Lessons and lab definitions |
| `lib/engine.ts` | Simulation rules, evidence checks, and progression |
| `lib/mentor.ts` | Rule-based learning guidance |
| `db/store.ts` | Per-user database operations and revision checks |
| `db/schema.ts`, `drizzle/` | Database schema and migrations |

## Verification

The repository includes tests for exercise rules and API behavior.

```bash
node tests/engine.test.cjs
node tests/api.test.cjs
npx tsc --noEmit
npm run build
```

API integration tests require a running local development server on port 5173. Test and production accounts use separate storage contexts. These commands are provided for local verification; passing results should be confirmed in the target environment.

## Current scope

BUGFORGE currently includes three simulated labs. It does **not** provide Docker-backed per-user lab environments, live Burp/browser integrations, model-powered tutoring, screen analysis, or real-world vulnerability scanning. Further labs and instructor-facing features are potential extensions, not part of this release.

Use the exercises only as training simulations. Any testing of real systems requires authorization and adherence to the applicable scope and policy.

## Development notes

The project uses a framework starter and platform-managed authentication/deployment integration. Third-party dependencies and their licenses remain subject to their respective notices.
