# WorkHive

A job board connecting job seekers with employers. Seekers browse openings, keep a
profile and CV on file, and apply; employers post roles and manage applicants; an
admin can manage every user and listing.

Built with Next.js 16 (App Router), PostgreSQL via Drizzle ORM, Better Auth, and
Tailwind CSS v4.

## Running it

You need Node.js 20+ and a PostgreSQL database. The project is currently pointed at
a free Neon database.

```bash
npm install
npm run db:setup    # create the tables (safe to re-run)
npm run dev         # http://localhost:3001
npm run db:seed     # optional: demo accounts + sample jobs (dev server must be running)
```

### Environment

Settings live in `.env.local`, which is gitignored and must not be committed.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Signs session cookies. Any long random string. |
| `BETTER_AUTH_URL` | Where the app is served from — must match the port |
| `BLOB_READ_WRITE_TOKEN` | Optional. Without it, CV uploads are saved to `public/uploads` instead of Vercel Blob. |

If you change the dev port, change `BETTER_AUTH_URL` to match, or sign-in will be
rejected as a cross-origin request.

### Demo accounts

After `npm run db:seed`, password `Passw0rd!23`:

| Role | Email |
| --- | --- |
| Employer | `employer@workhive.test` |
| Job seeker | `seeker@workhive.test` |
| Admin | `admin@workhive.test` |

## How it fits together

| Path | Contents |
| --- | --- |
| `app/` | Pages. `jobs/` is public; `dashboard/` is for seekers, `employer/` for employers, `admin/` for admins. |
| `app/actions/` | Server actions — every database read and write goes through here. |
| `app/api/auth/[...all]/` | Better Auth handler. Must stay a catch-all route. |
| `lib/db/schema.ts` | Drizzle table definitions. |
| `lib/session.ts` | `getSessionUser()` / `requireUser()` for auth checks in pages and actions. |
| `components/ui/` | Base UI primitives styled with Tailwind. |
| `scripts/` | Database setup, auth migration, and seed scripts. |

Roles are stored on the `user` row. `/redirect` reads the role after sign-in and
sends each person to their own dashboard.

### What each role can do

| | Seeker | Employer | Admin |
| --- | --- | --- | --- |
| Browse and search jobs | yes | yes | yes |
| Apply, then withdraw while still pending | yes | — | — |
| Keep a profile and CV on file | yes | — | — |
| Post, edit, close, and delete own jobs | — | yes | any job |
| Review applicants and set their status | — | yes | — |
| Publish a company profile shown on its listings | — | yes | — |
| Change any user's role, or delete a user | — | — | yes |

Every action in `app/actions/` re-checks the signed-in user, so a role cannot be
bypassed by calling an action directly — `requireJobOwner()` in `actions/jobs.ts` is
the shared check for anything that modifies a listing.

## Database scripts

| Command | What it does |
| --- | --- |
| `npm run db:setup` | Creates all tables and indexes. Idempotent. |
| `npm run db:migrate-auth` | Adds columns a newer Better Auth release expects. Run after upgrading `better-auth`. |
| `npm run db:seed` | Creates demo accounts and sample job listings. |

## Deploying

Push to GitHub, import the repository in Vercel, and set `DATABASE_URL`,
`BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` (your deployed URL) as environment
variables. Add `BLOB_READ_WRITE_TOKEN` if you want CV uploads stored in Vercel Blob
— on Vercel the local filesystem is read-only, so uploads need it there.
