import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { PostJobForm } from "@/components/post-job-form"
import { getSessionUser } from "@/lib/session"
import { getCompanyProfile } from "@/app/actions/profile"
import { employerNav } from "../nav"

export default async function NewJobPage() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "employer") redirect("/redirect")

  const company = await getCompanyProfile()

  return (
    <DashboardShell
      title="Post a job"
      subtitle="Fill in the details to publish a new opening"
      nav={employerNav}
      active="/employer/new"
    >
      <PostJobForm defaultCompany={company?.name ?? user.name} />
    </DashboardShell>
  )
}
