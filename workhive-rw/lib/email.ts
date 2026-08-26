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
const APP_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3001"

// Same palette as the app, taken from globals.css.
const BRAND = "#0063d1"
const PAGE_BG = "#eff4f8"
const TEXT = "#0d1c2a"
const MUTED = "#4f5f71"
const BORDER = "#d0dde5"

const isConfigured = Boolean(SMTP_USER && SMTP_PASSWORD)

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 is implicit TLS; 587 upgrades with STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  : null

type Item = { title: string; text: string }

type Message = {
  greeting: string
  paragraphs: string[]
  items?: Item[]
  button: { label: string; href: string }
  signOff?: string
}

/**
 * Builds the HTML body. Email clients only reliably support tables and inline
 * styles -- flexbox, grid, and <style> blocks are widely stripped -- so the
 * markup here is deliberately old-fashioned.
 */
function renderHtml({ greeting, paragraphs, items = [], button, signOff }: Message) {
  const paragraph = (t: string) =>
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${TEXT};">${t}</p>`

  const item = ({ title, text }: Item) => `
    <tr>
      <td style="padding:14px 0;border-top:1px solid ${BORDER};">
        <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:${TEXT};">${title}</p>
        <p style="margin:0;font-size:14px;line-height:1.5;color:${MUTED};">${text}</p>
      </td>
    </tr>`

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${PAGE_BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <tr>
            <td style="padding:22px 28px;border-bottom:1px solid ${BORDER};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${BRAND};border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;font-size:17px;">&#128188;</td>
                  <td style="padding-left:10px;font-size:18px;font-weight:700;color:${TEXT};">Work<span style="color:${BRAND};">Hive</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              ${paragraph(greeting)}
              ${paragraphs.map(paragraph).join("")}

              ${
                items.length
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;">
                       ${items.map(item).join("")}
                     </table>`
                  : ""
              }

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
                <tr>
                  <td style="background:${BRAND};border-radius:8px;">
                    <a href="${button.href}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${button.label}</a>
                  </td>
                </tr>
              </table>

              ${
                signOff
                  ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${MUTED};">${signOff}</p>`
                  : ""
              }
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px;border-top:1px solid ${BORDER};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
                WorkHive &middot; Kigali, Rwanda<br>
                You are receiving this because you have a WorkHive account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Plain-text copy for clients that refuse HTML, and for a better spam score. */
function renderText({ greeting, paragraphs, items = [], button, signOff }: Message) {
  return [
    greeting,
    "",
    ...paragraphs.flatMap((p) => [p.replace(/<[^>]+>/g, ""), ""]),
    ...items.flatMap((i) => [`- ${i.title}: ${i.text}`]),
    items.length ? "" : "",
    `${button.label}: ${button.href}`,
    "",
    signOff ?? "",
    "— The WorkHive team",
  ].join("\n")
}

async function send(to: string, subject: string, message: Message) {
  const html = renderHtml(message)
  const text = renderText(message)

  if (!transporter) {
    console.log(`\n[email not sent - SMTP is not configured]\n  to: ${to}\n  subject: ${subject}\n${text}\n`)
    return
  }

  try {
    await transporter.sendMail({ from: FROM, to, subject, text, html })
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
  const employer = role === "employer"

  await send(email, "Welcome to WorkHive", {
    greeting: `Hi ${name},`,
    paragraphs: [
      `Your WorkHive account is ready. You are registered as a <strong>${ROLE_LABEL[role] ?? role}</strong>.`,
      employer
        ? "Here is how to find your first hire."
        : "Here is how to get your first application in front of an employer.",
    ],
    items: employer
      ? [
          { title: "Set up your company", text: "Add your website, location, and a short description. It appears on every job you post." },
          { title: "Post a job", text: "Describe the role, set a salary range, and publish it to the board." },
          { title: "Review applicants", text: "Read CVs and cover notes, then mark people as shortlisted, accepted, or rejected." },
        ]
      : [
          { title: "Complete your profile", text: "A headline and a list of skills help employers understand your background." },
          { title: "Upload your CV", text: "Store it once and reuse it for every application." },
          { title: "Start applying", text: "Filter roles by category, type, and location, then apply in a couple of clicks." },
        ],
    button: {
      label: employer ? "Go to your dashboard" : "Browse open roles",
      href: employer ? `${APP_URL}/employer` : `${APP_URL}/jobs`,
    },
    signOff: "Glad to have you here,<br>The WorkHive team",
  })
}

/** Sent on each later sign-in, so people notice access they did not expect. */
export async function sendLoginAlertEmail(name: string, email: string, role: string) {
  const when = new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })

  await send(email, "New sign-in to your WorkHive account", {
    greeting: `Hi ${name},`,
    paragraphs: [
      `Your WorkHive account (<strong>${ROLE_LABEL[role] ?? role}</strong>) was signed in on ${when}.`,
      "If this was you, there is nothing to do. If it was not, change your password straight away.",
    ],
    button: { label: "Open WorkHive", href: APP_URL },
    signOff: "The WorkHive team",
  })
}
