# DSA Coach

A signed-in study app for interview prep. It tracks a Grind 169 algorithms list and a SQL problem set with spaced repetition, and it also holds a shared daily log and a whiteboard.

Progress is stored per user. Problem catalogs are shared.

## What you can do

| Area | Routes | What it is |
| --- | --- | --- |
| Algorithms | `/`, `/problem/[id]`, `/bookmarks`, `/review`, `/completed`, `/stats`, `/settings` | Grind 169 problems, a daily goal, a streak, and reviews scheduled from how confident you were |
| SQL | `/sql`, `/sql/problem/[id]`, `/sql/prerequisites`, `/sql/review`, `/sql/bookmarks`, `/sql/completed` | PostgreSQL-style problems (LeetCode, DataLemur, StrataScratch, and short conceptual items) plus a prerequisite checklist |
| Practice hub | `/whiteboard` | An Excalidraw canvas saved in the browser |
| Productivity | `/daily` | A shared daily problem log |
| Account | `/login`, `/change-password`, `/admin` | Email and password sign-in. Admins can add people and hand them a temporary password |

On a problem, these keys work when focus is not in a text field:

| Key | Action |
| --- | --- |
| `S` | Mark solved and pick a confidence level |
| `1`–`5` | Save that confidence (only after `S`) |
| `B` | Bookmark and go to the next problem |
| `R` | Flag for review and go to the next problem |
| `K` | Skip |
| `N` | Next problem |

Review gaps are 1, 3, 7, 14, and 30 days for confidence levels 1 through 5. The dashboard serves a due review before a new problem. Settings control the daily goal (default 3) and whether new problems come easiest-first or hardest-first.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- Tailwind CSS 4
- Drizzle ORM with [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts) (local SQLite file or [Turso](https://turso.tech))
- Zustand for client study state
- bcrypt passwords and an HMAC session cookie (`auth_session`, 7 days)
- `proxy.ts` sends signed-out visitors to `/login`

## Prerequisites

- Node.js 20.9 or newer
- npm

## Setup

```bash
npm install
```

Create `.env.local` in the project root (see [Environment](#environment)), then:

```bash
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `AUTH_USERNAME` and `AUTH_PASSWORD`. That first sign-in creates the account. `AUTH_USERNAME` is treated as an admin, so you can open `/admin` and add other people.

`.env.local` is gitignored. The app and the seed script both load it.

### Environment

```bash
# Local SQLite file in the project root. No auth token needed.
TURSO_DATABASE_URL=file:local.db

# Remote Turso only. Leave unset for a local file.
# TURSO_AUTH_TOKEN=

# Bootstrap admin. Use an email; it is stored lowercased.
AUTH_USERNAME=you@example.com
AUTH_PASSWORD=choose-a-password

# Signs the session cookie. Set this in any shared environment.
SESSION_SECRET=replace-with-a-long-random-string
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Yes | Database URL. `file:local.db` for a local file, or a `libsql://` Turso URL |
| `TURSO_AUTH_TOKEN` | Remote Turso only | Token for that Turso database |
| `AUTH_USERNAME` | Yes, for the first admin | Email that can sign in before any user row exists, and that is always an admin |
| `AUTH_PASSWORD` | Yes, for that first sign-in | Password checked when the account has no hash yet. After a successful sign-in the hash is stored |
| `SESSION_SECRET` | Strongly recommended | HMAC key for the session cookie. If unset, the app falls back to `AUTH_PASSWORD` |
| `NEXT_PUBLIC_AUTH_USERNAME` | No | Extra email treated as a bootstrap admin, same as `AUTH_USERNAME` |

A new user created from `/admin` gets a temporary password and is sent to `/change-password` on first sign-in.

## Database

Schema lives in `db/schema.ts`. The running app does not apply a checked-in migration folder. `db/init.ts` and `db/progressSchema.ts` create missing tables, add columns that are not there yet, and load the DSA and SQL catalogs. That runs when you seed, and again on sign-in and on admin actions. Re-running it keeps existing progress (`INSERT OR IGNORE` / `onConflictDoNothing`).

### Seed

Creates tables, applies those additive changes, and loads the Grind 169 list, SQL problems, and SQL prerequisites.

```bash
npm run seed
```

### Migrate with Drizzle Kit

Use this when you change `db/schema.ts` and want Drizzle Kit to sync or generate SQL. Config is `drizzle.config.ts`. It reads `TURSO_DATABASE_URL` from `.env.local`. Generated files go in `./drizzle` (that folder is not part of the repo today).

```bash
# Push db/schema.ts straight to the database
npx drizzle-kit push

# Write SQL migrations into ./drizzle
npx drizzle-kit generate

# Apply the SQL files in ./drizzle
npx drizzle-kit migrate

# Browse the database
npx drizzle-kit studio
```

Day-to-day setup only needs `npm run seed`. Drizzle Kit does not replace `initDb`: sign-in still runs the additive SQL in `db/init.ts`, which is what creates per-user progress tables and backfills older single-user rows.

### Tables

| Table | Holds |
| --- | --- |
| `problems`, `sql_problems`, `sql_prerequisites` | Shared catalogs |
| `problem_progress`, `sql_problem_progress`, `sql_prerequisite_progress` | Per-user status, notes, solve time, review date, confidence |
| `user_stats` | Daily goal, streak, last active day, problem order |
| `users` | Accounts, password hash, role (`admin` or `user`) |
| `daily_logs` | Shared daily writeups |
| `allowed_emails` | Declared in the schema; sign-in is account-based |

## Run and build

```bash
npm run dev      # development server, http://localhost:3000
npm run lint     # ESLint
npm run build    # production build
npm run start    # serve the production build
```

`build` and `start` need the same environment variables as development. Point `TURSO_DATABASE_URL` at the database that should keep user progress.

## Scripts

| Script | Command |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |
| `seed` | `tsx scripts/seed.ts` |

## Layout

```
app/                 pages, layouts, and route handlers
  (dsa)/             algorithms dashboard and problem flow
  sql/               SQL practice
  api/               daily logs
  actions/           auth and user admin
  login, change-password, admin, daily, whiteboard
components/          shell, sidebar, admin, whiteboard
data/grind169.json   source list mirrored by the embedded catalog in db/init.ts
db/                  Drizzle schema, libsql client, runtime schema setup, SQL catalog
features/            sidebar nav and shared study UI
lib/                 session cookie, auth, daily-log queries
scripts/seed.ts      one-shot seed and schema setup
store/               Zustand stores for DSA and SQL progress
drizzle.config.ts    Drizzle Kit config
proxy.ts             redirects unsigned requests to /login
```

Imports use the `@/` alias, which maps to the repo root (`tsconfig.json`).
