"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, MapPin, MoreVertical, Eye, Pencil, Trash2, Pause, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApplicantsDialog } from "@/components/applicants-dialog"
import { updateJobStatus, deleteJob } from "@/app/actions/jobs"
import { timeAgo } from "@/lib/format"
import { toast } from "sonner"

type Job = {
  id: number
  title: string
  location: string
  type: string
  status: string
  createdAt: Date | string
  applicantCount: number
}

export function EmployerJobList({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewJob, setViewJob] = useState<Job | null>(null)

  function toggleStatus(job: Job) {
    const next = job.status === "active" ? "closed" : "active"
    startTransition(async () => {
      await updateJobStatus(job.id, next)
      toast.success(next === "active" ? "Job reopened" : "Job closed")
      router.refresh()
    })
  }

  function remove(job: Job) {
    startTransition(async () => {
      await deleteJob(job.id)
      toast.success("Job deleted")
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <Card key={job.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <Badge
                    variant={job.status === "active" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span>{job.type}</span>
                  <span>Posted {timeAgo(job.createdAt)}</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Job actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/jobs/${job.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/employer/${job.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit job
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleStatus(job)} disabled={isPending}>
                    {job.status === "active" ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Close job
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Reopen job
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => remove(job)}
                    disabled={isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
              </span>
              <Button variant="outline" size="sm" onClick={() => setViewJob(job)}>
                View applicants
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {viewJob && (
        <ApplicantsDialog
          jobId={viewJob.id}
          jobTitle={viewJob.title}
          open={Boolean(viewJob)}
          onOpenChange={(o) => !o && setViewJob(null)}
        />
      )}
    </>
  )
}
