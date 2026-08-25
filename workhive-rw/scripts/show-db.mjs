// Prints what is currently stored in the database.
//   node scripts/show-db.mjs          -> row counts + a preview of every table
//   node scripts/show-db.mjs job      -> every row of one table
import fs from 'node:fs'
import pg from 'pg'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

// Columns worth showing per table, so wide rows stay readable in a terminal.
const PREVIEW = {
  user: ['id', 'name', 'email', 'role'],
  session: ['id', 'userId', 'expiresAt'],
  account: ['id', 'userId', 'providerId'],
  verification: ['id', 'identifier', 'expiresAt'],
  company_profile: ['id', 'userId', 'name', 'location'],
  seeker_profile: ['id', 'userId', 'headline', 'cvName'],
  job: ['id', 'title', 'companyName', 'category', 'location', 'status'],
  application: ['id', 'jobId', 'seekerId', 'status'],
}

const only = process.argv[2]
const tables = only ? [only] : Object.keys(PREVIEW)

if (only && !PREVIEW[only]) {
  console.error(`Unknown table "${only}". Try one of: ${Object.keys(PREVIEW).join(', ')}`)
  process.exit(1)
}

const client = new pg.Client({ connectionString: env.DATABASE_URL })
await client.connect()

for (const table of tables) {
  const { rows: [{ n }] } = await client.query(`select count(*)::int n from "${table}"`)
  console.log(`\n${table}  (${n} row${n === 1 ? '' : 's'})`)

  if (n === 0) {
    console.log('  empty')
    continue
  }

  // Full contents when asking for one table, otherwise just the first few rows.
  const columns = only ? '*' : PREVIEW[table].map((c) => `"${c}"`).join(', ')
  const limit = only ? '' : ' limit 5'
  const { rows } = await client.query(`select ${columns} from "${table}"${limit}`)

  console.table(
    rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [
          k,
          typeof v === 'string' && v.length > 30 ? v.slice(0, 30) + '…' : v,
        ]),
      ),
    ),
  )

  if (!only && n > 5) console.log(`  ... ${n - 5} more (run: npm run db:show ${table})`)
}

await client.end()
