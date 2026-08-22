import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { CompanyProfileForm } from "@/components/company-profile-form"
import { getSessionUser } from "@/lib/session"
import { getCompanyProfile } from "@/app/actions/profile"
import { employerNav } from "../nav"

export default async function CompanyProfilePage() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "employer") redirect("/redirect")

  const company = await getCompanyProfile()

  return (
    <DashboardShell
      title="Company profile"
      subtitle="This information appears on your job listings"
      nav={employerNav}
      active="/employer/profile"
    >
      <CompanyProfileForm company={company} />
    </DashboardShell>
  )
}
