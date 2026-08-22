import { redirect } from "next/navigation"
import { Users, Briefcase, FileText } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { AdminManager } from "@/components/admin-manager"
import { getSessionUser } from "@/lib/session"
import { getAdminStats, getAllUsers, getAllJobs } from "@/app/actions/admin"

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user) redirect("/sign-in")
  if (user.role !== "admin") redirect("/redirect")

  const [stats, users, jobs] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
    getAllJobs(),
  ])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin panel</h1>
          <p className="mt-1 text-muted-foreground">
            Manage users, moderate job postings, and monitor platform activity.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={stats.users} />
          <StatCard icon={<Briefcase className="h-5 w-5" />} label="Total jobs" value={stats.jobs} />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Applications"
            value={stats.applications}
          />
        </div>

        <AdminManager users={users} jobs={jobs} currentUserId={user.id} />
      </main>
    </div>
  )
}

function StatCard({
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
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
