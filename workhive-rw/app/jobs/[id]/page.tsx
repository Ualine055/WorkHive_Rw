import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Briefcase, Banknote, Clock, ArrowLeft, CheckCircle2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApplyDialog } from "@/components/apply-dialog"
import { getJobById } from "@/app/actions/jobs"
import { hasApplied } from "@/app/actions/applications"
import { getSeekerProfile } from "@/app/actions/profile"
import { getSessionUser } from "@/lib/session"
import { formatSalary, timeAgo } from "@/lib/format"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJobById(Number(id))
  if (!job) notFound()

  const user = await getSessionUser()
  const isSeeker = user?.role === "seeker"

  let applied = false
  let defaultCv: { url: string; name: string } | null = null
  if (isSeeker) {
    applied = await hasApplied(job.id)
    const profile = await getSeekerProfile()
    if (profile?.cvUrl && profile?.cvName) {
      defaultCv = { url: profile.cvUrl, name: profile.cvName }
    }
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax)

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/jobs">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to jobs
          </Link>
        </Button>

        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {job.companyName.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                  {job.title}
                </h1>
                <p className="text-muted-foreground">{job.companyName}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{job.type}</Badge>
                  <Badge variant="outline">{job.category}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={job.location} />
            <Info
              icon={<Banknote className="h-4 w-4" />}
              label="Salary"
              value={salary ?? "Not disclosed"}
            />
            <Info
              icon={<Clock className="h-4 w-4" />}
              label="Posted"
              value={timeAgo(job.createdAt)}
            />
          </div>

          <Separator className="my-6" />

          <h2 className="mb-2 text-lg font-semibold text-foreground">Job description</h2>
          <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {job.description}
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col gap-3">
            {!user && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Sign in as a job seeker to apply for this role.
                </p>
                <Button asChild size="lg">
                  <Link href="/sign-in">Sign in to apply</Link>
                </Button>
              </div>
            )}

            {user && !isSeeker && (
              <p className="text-sm text-muted-foreground">
                You&apos;re signed in as {user.role}. Only job seeker accounts can apply.
              </p>
            )}

            {isSeeker && applied && (
              <div className="flex items-center gap-2 rounded-lg bg-chart-3/10 px-4 py-3 text-chart-3">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">You&apos;ve applied to this job</span>
              </div>
            )}

            {isSeeker && !applied && (
              <ApplyDialog jobId={job.id} jobTitle={job.title} defaultCv={defaultCv} />
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  )
}
