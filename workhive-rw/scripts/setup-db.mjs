// Creates the WorkHive tables in the database named by DATABASE_URL.
// Safe to re-run: every statement uses IF NOT EXISTS.
//   node scripts/setup-db.mjs
import pg from 'pg'
import fs from 'node:fs'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const SQL = `
-- ---------------------------------------------------------------- Better Auth
CREATE TABLE IF NOT EXISTS "user" (
  "id"            text PRIMARY KEY,
  "name"          text NOT NULL,
  "email"         text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image"         text,
  "role"          text NOT NULL DEFAULT 'seeker',
  "createdAt"     timestamp NOT NULL DEFAULT now(),
  "updatedAt"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"        text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token"     text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId"    text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                    text PRIMARY KEY,
  "accountId"             text NOT NULL,
  "providerId"            text NOT NULL,
  "issuer"                text,
  "userId"                text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope"                 text,
  "password"              text,
  "createdAt"             timestamp NOT NULL DEFAULT now(),
  "updatedAt"             timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"         text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value"      text NOT NULL,
  "expiresAt"  timestamp NOT NULL,
  "createdAt"  timestamp DEFAULT now(),
  "updatedAt"  timestamp DEFAULT now()
);

-- ----------------------------------------------------------------- App tables
CREATE TABLE IF NOT EXISTS "company_profile" (
  "id"        serial PRIMARY KEY,
  "userId"    text NOT NULL,
  "name"      text NOT NULL,
  "website"   text,
  "location"  text,
  "about"     text,
  "logoUrl"   text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "seeker_profile" (
  "id"         serial PRIMARY KEY,
  "userId"     text NOT NULL,
  "headline"   text,
  "bio"        text,
  "location"   text,
  "skills"     text,
  "experience" text,
  "cvUrl"      text,
  "cvName"     text,
  "createdAt"  timestamp NOT NULL DEFAULT now(),
  "updatedAt"  timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "job" (
  "id"          serial PRIMARY KEY,
  "userId"      text NOT NULL,
  "companyName" text NOT NULL,
  "title"       text NOT NULL,
  "description" text NOT NULL,
  "location"    text NOT NULL,
  "type"        text NOT NULL DEFAULT 'Full-time',
  "category"    text NOT NULL DEFAULT 'Other',
  "salaryMin"   integer,
  "salaryMax"   integer,
  "status"      text NOT NULL DEFAULT 'active',
  "createdAt"   timestamp NOT NULL DEFAULT now(),
  "updatedAt"   timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "application" (
  "id"          serial PRIMARY KEY,
  "jobId"       integer NOT NULL,
  "seekerId"    text NOT NULL,
  "employerId"  text NOT NULL,
  "coverLetter" text,
  "cvUrl"       text,
  "cvName"      text,
  "status"      text NOT NULL DEFAULT 'pending',
  "createdAt"   timestamp NOT NULL DEFAULT now(),
  "updatedAt"   timestamp NOT NULL DEFAULT now()
);

-- Indexes for the lookups the app does on every page
CREATE INDEX IF NOT EXISTS "job_status_idx"          ON "job" ("status");
CREATE INDEX IF NOT EXISTS "job_user_idx"            ON "job" ("userId");
CREATE INDEX IF NOT EXISTS "application_job_idx"     ON "application" ("jobId");
CREATE INDEX IF NOT EXISTS "application_seeker_idx"  ON "application" ("seekerId");
CREATE INDEX IF NOT EXISTS "application_employer_idx" ON "application" ("employerId");
CREATE INDEX IF NOT EXISTS "seeker_profile_user_idx" ON "seeker_profile" ("userId");
CREATE INDEX IF NOT EXISTS "company_profile_user_idx" ON "company_profile" ("userId");
`

const client = new pg.Client({ connectionString: env.DATABASE_URL })
await client.connect()
await client.query(SQL)

const { rows } = await client.query(
  `select table_name from information_schema.tables
   where table_schema = 'public' order by table_name`,
)
console.log('Tables in the database:')
for (const r of rows) console.log('  -', r.table_name)
await client.end()
