import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"
import { sendWelcomeEmail, sendLoginAlertEmail } from "@/lib/email"

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.V0_RUNTIME_URL ?? "http://localhost:3000")),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "seeker",
        input: true,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const u = user as typeof user & { role?: string }
          await sendWelcomeEmail(u.name, u.email, u.role ?? "seeker")
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          const rows = await pool.query(
            'select "name", "email", "role", "createdAt" from "user" where "id" = $1',
            [session.userId],
          )
          const u = rows.rows[0]
          if (!u) return

          // autoSignIn creates a session right after sign-up. The welcome email
          // already went out, so skip the alert for a brand new account.
          const accountAgeMs = Date.now() - new Date(u.createdAt).getTime()
          if (accountAgeMs < 10_000) return

          await sendLoginAlertEmail(u.name, u.email, u.role ?? "seeker")
        },
      },
    },
  },
  ...(process.env.V0_RUNTIME_URL
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
