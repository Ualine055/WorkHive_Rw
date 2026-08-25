import { notFound, redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { PostJobForm } from "@/components/post-job-form"
import { getSessionUser } from "@/lib/session"
import { getJobById } from "@/app/actions/jobs"
import { employerNav } from "../../nav"

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "employer") redirect("/redirect")

  const { id } = await params
  const job = await getJobById(Number(id))

  // Treat someone else's job as missing rather than revealing that it exists.
  if (!job || job.userId !== user.id) notFound()

  return (
    <DashboardShell
      title="Edit job"
      subtitle={job.title}
      nav={employerNav}
      active="/employer"
    >
      <PostJobForm defaultCompany={job.companyName} job={job} />
    </DashboardShell>
  )
}
