// Checks the email setup and sends a real test message, without having to
// register an account first.
//   node scripts/test-email.mjs you@gmail.com
import fs from 'node:fs'
import nodemailer from 'nodemailer'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const to = process.argv[2]
if (!to) {
  console.error('Usage: npm run email:test -- you@gmail.com')
  process.exit(1)
}

const { SMTP_HOST = 'smtp.gmail.com', SMTP_PORT = '587', SMTP_USER, SMTP_PASSWORD } = env

console.log('Settings in .env.local')
console.log('  SMTP_HOST     ', SMTP_HOST)
console.log('  SMTP_PORT     ', SMTP_PORT)
console.log('  SMTP_USER     ', SMTP_USER || '(empty)')
console.log('  SMTP_PASSWORD ', SMTP_PASSWORD ? `${SMTP_PASSWORD.length} characters` : '(empty)')

if (!SMTP_USER || !SMTP_PASSWORD) {
  console.error(`
Nothing will be sent while these are empty. Fill them in .env.local:

  SMTP_USER=yourname@gmail.com
  SMTP_PASSWORD=your16charapppassword
  SMTP_FROM=WorkHive <yourname@gmail.com>

The password must be a Google App Password (16 characters), not your normal
Gmail password. Create one at https://myaccount.google.com/apppasswords
- it only appears once 2-Step Verification is switched on.`)
  process.exit(1)
}

if (SMTP_PASSWORD.includes(' ')) {
  console.error('\nSMTP_PASSWORD contains spaces. Google shows the App Password in four')
  console.error('blocks for readability - remove the spaces so it is 16 characters.')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
})

console.log(`\nConnecting to ${SMTP_HOST}:${SMTP_PORT} ...`)

try {
  await transporter.verify()
  console.log('Login accepted.')
} catch (error) {
  console.error('\nCould not log in to the mail server:')
  console.error(' ', error.message)
  if (String(error.message).includes('Username and Password not accepted')) {
    console.error(`
Google rejected the credentials. The usual causes:
  - SMTP_PASSWORD is your normal Gmail password rather than an App Password
  - the App Password was revoked, or belongs to a different Google account
  - SMTP_USER is not the same address the App Password was created for`)
  }
  process.exit(1)
}

console.log(`Sending a test message to ${to} ...`)

await transporter.sendMail({
  from: env.SMTP_FROM ?? `WorkHive <${SMTP_USER}>`,
  to,
  subject: 'WorkHive email test',
  text: 'If you can read this, WorkHive can send email. Welcome and sign-in messages will now arrive here.',
  html: `<div style="font-family:sans-serif;padding:24px;background:#eff4f8;">
    <div style="max-width:480px;margin:auto;background:#fff;border:1px solid #d0dde5;border-radius:12px;padding:24px;">
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0d1c2a;">Work<span style="color:#0063d1;">Hive</span></p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#0d1c2a;">
        If you can read this, WorkHive can send email. Welcome and sign-in
        messages will now arrive here.
      </p>
    </div>
  </div>`,
})

console.log(`
Sent. Check the inbox for ${to} (look in Spam too, the first time).

Now restart the dev server so the app picks up the new settings:
  npm run dev`)
