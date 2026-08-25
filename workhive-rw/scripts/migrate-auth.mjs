// Applies the schema the installed Better Auth version expects. Newer releases
// add columns (e.g. account.issuer in 1.7), so re-run this after upgrading.
//   node scripts/migrate-auth.mjs
import fs from 'node:fs'
import pg from 'pg'
import { getMigrations } from 'better-auth/db/migration'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

// Mirrors the parts of lib/auth.ts that affect the database schema.
const options = {
  database: new pg.Pool({ connectionString: env.DATABASE_URL }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'seeker', input: true },
    },
  },
}

const { toBeAdded, toBeCreated, runMigrations } = await getMigrations(options)

if (!toBeAdded.length && !toBeCreated.length) {
  console.log('Auth schema already up to date.')
} else {
  for (const t of toBeCreated) console.log('create table', t.table + ':', Object.keys(t.fields).join(', '))
  for (const t of toBeAdded) console.log('add to', t.table + ':', Object.keys(t.fields).join(', '))
  await runMigrations()
  console.log('Auth migrations applied.')
}
process.exit(0)
