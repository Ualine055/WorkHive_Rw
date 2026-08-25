// Fills the database with demo accounts and job listings so the app has
// something to show. Start the dev server first, then:
//   node scripts/seed.mjs
// Accounts are created through the real sign-up endpoint so passwords are
// hashed the same way Better Auth does it. Safe to re-run.
import fs from 'node:fs'
import pg from 'pg'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const BASE = env.BETTER_AUTH_URL ?? 'http://localhost:3001'
const PASSWORD = 'Passw0rd!23'

const ACCOUNTS = [
  { email: 'employer@workhive.test', name: 'Grace Uwase', role: 'employer' },
  { email: 'seeker@workhive.test', name: 'Eric Habimana', role: 'seeker' },
  { email: 'admin@workhive.test', name: 'Site Admin', role: 'admin' },
]

const JOBS = [
  {
    companyName: 'Kigali Tech Hub',
    title: 'Frontend Developer',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    category: 'Engineering',
    salaryMin: 45000,
    salaryMax: 70000,
    description: [
      'We are looking for a Frontend Developer to help build the products our customers use every day.',
      '',
      'What you will do',
      '- Build responsive interfaces with React and TypeScript',
      '- Work with designers to turn mockups into production screens',
      '- Review code and help teammates grow',
      '',
      'What we are looking for',
      '- 2+ years with React or a similar framework',
      '- Comfortable with modern CSS and accessibility basics',
      '- Clear communicator who enjoys collaborating',
    ].join('\n'),
  },
  {
    companyName: 'Kigali Tech Hub',
    title: 'Backend Engineer (Node.js)',
    location: 'Remote',
    type: 'Remote',
    category: 'Engineering',
    salaryMin: 55000,
    salaryMax: 85000,
    description: [
      'Join our platform team and own the services behind our public API.',
      '',
      'Responsibilities',
      '- Design and ship REST endpoints used by web and mobile clients',
      '- Model data in PostgreSQL and keep queries fast',
      '- Add monitoring so we find problems before customers do',
      '',
      'Requirements',
      '- Strong Node.js and SQL experience',
      '- Familiarity with cloud deployment',
      '- Care for testing and documentation',
    ].join('\n'),
  },
  {
    companyName: 'Umoja Design Studio',
    title: 'Product Designer',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    category: 'Design',
    salaryMin: 40000,
    salaryMax: 60000,
    description: [
      'We help East African startups turn ideas into products people love.',
      '',
      'The role',
      '- Run discovery interviews and turn findings into flows',
      '- Design end-to-end experiences, from wireframe to polished UI',
      '- Maintain and grow our design system',
      '',
      'You will fit well if',
      '- You have a portfolio of shipped digital products',
      '- You are fluent in Figma',
      '- You enjoy explaining the reasoning behind your decisions',
    ].join('\n'),
  },
  {
    companyName: 'Sunrise Finance',
    title: 'Financial Analyst',
    location: 'Kigali, Rwanda',
    type: 'Full-time',
    category: 'Finance',
    salaryMin: 35000,
    salaryMax: 52000,
    description: [
      'Support the finance team with reporting, forecasting, and analysis.',
      '',
      'Day to day',
      '- Prepare monthly management reports',
      '- Build models for budgeting and scenario planning',
      '- Partner with department heads on spending',
      '',
      'Requirements',
      '- Degree in finance, accounting, or economics',
      '- Advanced spreadsheet skills',
      '- Attention to detail and a habit of double-checking numbers',
    ].join('\n'),
  },
  {
    companyName: 'BrightPath Marketing',
    title: 'Digital Marketing Intern',
    location: 'Huye, Rwanda',
    type: 'Internship',
    category: 'Marketing',
    salaryMin: null,
    salaryMax: null,
    description: [
      'A six-month internship for someone starting a marketing career.',
      '',
      'You will learn to',
      '- Plan and schedule social media content',
      '- Write copy for campaigns and newsletters',
      '- Read analytics and report on what worked',
      '',
      'We are looking for',
      '- Recent graduate or final-year student',
      '- Strong written English and Kinyarwanda',
      '- Curiosity and willingness to ask questions',
    ].join('\n'),
  },
  {
    companyName: 'HealthLink Rwanda',
    title: 'Customer Support Specialist',
    location: 'Kigali, Rwanda',
    type: 'Part-time',
    category: 'Customer Support',
    salaryMin: 22000,
    salaryMax: 32000,
    description: [
      'Be the first person our users talk to when they need help.',
      '',
      'Responsibilities',
      '- Answer questions over chat, email, and phone',
      '- Log issues clearly so engineering can reproduce them',
      '- Suggest help-centre articles based on common questions',
      '',
      'Requirements',
      '- Patient, clear communicator',
      '- Comfortable learning new software quickly',
      '- Available for afternoon shifts',
    ].join('\n'),
  },
]

async function ensureAccount(account) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ ...account, password: PASSWORD }),
  })
  if (res.ok) {
    console.log('  created', account.email)
    return
  }
  const body = await res.text()
  if (body.includes('already exists') || body.includes('USER_ALREADY_EXISTS')) {
    console.log('  exists ', account.email)
    return
  }
  throw new Error(`sign-up failed for ${account.email}: ${res.status} ${body}`)
}

console.log(`Seeding via ${BASE}`)

try {
  await fetch(`${BASE}/api/auth/get-session`, { headers: { Origin: BASE } })
} catch {
  console.error(`\nCannot reach ${BASE}. Start the dev server first:\n  npm run dev\n`)
  process.exit(1)
}

console.log('Accounts:')
for (const a of ACCOUNTS) await ensureAccount(a)

const client = new pg.Client({ connectionString: env.DATABASE_URL })
await client.connect()

// Sign-up only accepts seeker/employer, so the admin role is set directly.
await client.query('update "user" set "role" = $1 where "email" = $2', [
  'admin',
  'admin@workhive.test',
])

const { rows } = await client.query('select "id" from "user" where "email" = $1', [
  'employer@workhive.test',
])
const employerId = rows[0]?.id
if (!employerId) throw new Error('demo employer was not created')

await client.query(
  `insert into "company_profile" ("userId", "name", "website", "location", "about")
   select $1, $2, $3, $4, $5
   where not exists (select 1 from "company_profile" where "userId" = $1)`,
  [
    employerId,
    'Kigali Tech Hub',
    'https://example.com',
    'Kigali, Rwanda',
    'A product studio building software for businesses across East Africa.',
  ],
)

console.log('Jobs:')
for (const j of JOBS) {
  const existing = await client.query(
    'select 1 from "job" where "title" = $1 and "companyName" = $2',
    [j.title, j.companyName],
  )
  if (existing.rowCount) {
    console.log('  exists ', j.title)
    continue
  }
  await client.query(
    `insert into "job"
       ("userId","companyName","title","description","location","type","category","salaryMin","salaryMax")
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      employerId,
      j.companyName,
      j.title,
      j.description,
      j.location,
      j.type,
      j.category,
      j.salaryMin,
      j.salaryMax,
    ],
  )
  console.log('  created', j.title)
}

const counts = await client.query(
  `select (select count(*) from "user") as users, (select count(*) from "job") as jobs`,
)
console.log(`\nDone. ${counts.rows[0].users} users, ${counts.rows[0].jobs} jobs.`)
console.log(`\nDemo logins (password: ${PASSWORD})`)
for (const a of ACCOUNTS) console.log(`  ${a.role.padEnd(9)} ${a.email}`)
await client.end()
