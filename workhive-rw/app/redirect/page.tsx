import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"

export default async function RedirectPage() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role === "admin") redirect("/admin")
  if (user.role === "employer") redirect("/employer")
  redirect("/dashboard")
}
