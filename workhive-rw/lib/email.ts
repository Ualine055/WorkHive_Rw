import nodemailer from "nodemailer"

/**
 * Sends mail over SMTP, which works with Gmail, Outlook, Mailtrap, or any other
 * provider. Configure it with SMTP_USER and SMTP_PASSWORD in .env.local.
 *
 * With no credentials set, emails are printed to the terminal instead of being
 * sent, so the app still runs on a machine that has no mail account.
 */

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com"
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const FROM = process.env.SMTP_FROM ?? `WorkHive <${SMTP_USER}>`

const isConfigured = Boolean(SMTP_USER && SMTP_PASSWORD)

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 is implicit TLS; 587 upgrades with STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  : null

async function send(to: string, subject: string, body: string) {
  if (!transporter) {
    console.log(`\n[email not sent - SMTP is not configured]\n  to: ${to}\n  subject: ${subject}\n${body}\n`)
    return
  }

  try {
    await transporter.sendMail({ from: FROM, to, subject, text: body })
    console.log(`[email] sent "${subject}" to ${to}`)
  } catch (error) {
    // A failed email must never stop someone signing up or signing in.
    console.error(`[email] could not send to ${to}:`, error)
  }
}

const ROLE_LABEL: Record<string, string> = {
  seeker: "job seeker",
  employer: "employer",
  admin: "administrator",
}

/** Sent once, when the account is first created. */
export async function sendWelcomeEmail(name: string, email: string, role: string) {
  const nextStep =
    role === "employer"
      ? "Post your first job from the employer dashboard, then review applicants as they arrive."
      : "Complete your profile, upload your CV, and start applying to roles that fit you."

  await send(
    email,
    "Welcome to WorkHive",
    `Hi ${name},

Your WorkHive account is ready. You are registered as a ${ROLE_LABEL[role] ?? role}.

${nextStep}

Sign in any time at ${process.env.BETTER_AUTH_URL ?? "http://localhost:3001"}

— The WorkHive team`,
  )
}

/** Sent on each later sign-in, so people notice access they did not expect. */
export async function sendLoginAlertEmail(name: string, email: string, role: string) {
  const when = new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })

  await send(
    email,
    "New sign-in to your WorkHive account",
    `Hi ${name},

Your WorkHive account (${ROLE_LABEL[role] ?? role}) was signed in on ${when}.

If this was you, no action is needed. If it was not, change your password straight away.

— The WorkHive team`,
  )
}
