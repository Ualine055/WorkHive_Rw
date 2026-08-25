import { defineConfig } from "drizzle-kit"

// drizzle-kit runs outside Next.js, so it does not pick up .env.local by itself.
process.loadEnvFile(".env.local")

// Used by Drizzle Studio (`npm run db:studio`) to find the tables and the database.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
