import Link from "next/link"
import { redirect } from "next/navigation"
import { FileText, MapPin, Search } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/session"
import { getMyApplications } from "@/app/actions/applications"
import { timeAgo, STATUS_STYLES } from "@/lib/format"
import { seekerNav } from "./nav"

export default async function SeekerDashboard() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "seeker") redirect("/redirect")

  const applications = await getMyApplications()

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  }

  return (
    <DashboardShell
      title={`Welcome, ${user.name.split(" ")[0]}`}
      subtitle="Track your job applications"
      nav={seekerNav}
      active="/dashboard"
      action={
        <Button asChild>
          <Link href="/jobs">
            <Search className="mr-2 h-4 w-4" />
            Find jobs
          </Link>
        </Button>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Applied" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Shortlisted" value={stats.shortlisted} />
        <Stat label="Accepted" value={stats.accepted} />
      </div>

      {applications.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">No applications yet</p>
            <p className="text-sm text-muted-foreground">
              Browse open roles and submit your first application.
            </p>
          </div>
          <Button asChild>
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/jobs/${app.jobId}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {app.jobTitle}
                  </Link>
                  <p className="text-sm text-muted-foreground">{app.companyName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {app.location}
                    </span>
                    <span>Applied {timeAgo(app.createdAt)}</span>
                  </div>
                </div>
                <Badge className={`capitalize ${STATUS_STYLES[app.status] ?? ""}`}>
                  {app.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  )
}
