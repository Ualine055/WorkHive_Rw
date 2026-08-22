import Link from "next/link"
import { redirect } from "next/navigation"
import { Briefcase, PlusCircle, Users, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmployerJobList } from "@/components/employer-job-list"
import { getSessionUser } from "@/lib/session"
import { getEmployerJobs } from "@/app/actions/jobs"
import { employerNav } from "./nav"

export default async function EmployerDashboard() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "employer") redirect("/redirect")

  const jobs = await getEmployerJobs()
  const activeCount = jobs.filter((j) => j.status === "active").length
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0)

  return (
    <DashboardShell
      title="Employer dashboard"
      subtitle="Manage your job postings and applicants"
      nav={employerNav}
      active="/employer"
      action={
        <Button asChild>
          <Link href="/employer/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post a job
          </Link>
        </Button>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={<Briefcase className="h-4 w-4" />} label="Total jobs" value={jobs.length} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Active" value={activeCount} />
        <Stat icon={<Users className="h-4 w-4" />} label="Applicants" value={totalApplicants} />
      </div>

      {jobs.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">No jobs posted yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first listing to start receiving applications.
            </p>
          </div>
          <Button asChild>
            <Link href="/employer/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a job
            </Link>
          </Button>
        </Card>
      ) : (
        <EmployerJobList jobs={jobs} />
      )}
    </DashboardShell>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
