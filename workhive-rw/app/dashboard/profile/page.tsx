import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { SeekerProfileForm } from "@/components/seeker-profile-form"
import { getSessionUser } from "@/lib/session"
import { getSeekerProfile } from "@/app/actions/profile"
import { seekerNav } from "../nav"

export default async function SeekerProfilePage() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "seeker") redirect("/redirect")

  const profile = await getSeekerProfile()

  return (
    <DashboardShell
      title="My profile"
      subtitle="Keep your details current so employers can find you"
      nav={seekerNav}
      active="/dashboard/profile"
    >
      <SeekerProfileForm profile={profile} />
    </DashboardShell>
  )
}
