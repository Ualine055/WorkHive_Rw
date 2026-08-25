"use client"

import { useEffect, useState, useTransition } from "react"
import { FileText, Loader2, Mail, Download, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApplicantsForJob, updateApplicationStatus } from "@/app/actions/applications"
import { STATUS_STYLES } from "@/lib/format"
import { toast } from "sonner"

type Applicant = {
  id: number
  status: string
  coverLetter: string | null
  cvUrl: string | null
  cvName: string | null
  applicantName: string
  applicantEmail: string
  headline: string | null
  skills: string | null
}

const STATUSES = ["pending", "reviewing", "shortlisted", "accepted", "rejected"]

export function ApplicantsDialog({
  jobId,
  jobTitle,
  open,
  onOpenChange,
}: {
  jobId: number
  jobTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loadedJobId, setLoadedJobId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const loading = loadedJobId !== jobId

  useEffect(() => {
    if (!open) return
    let cancelled = false
    getApplicantsForJob(jobId)
      .then((data) => {
        if (!cancelled) setApplicants(data as Applicant[])
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load applicants")
      })
      .finally(() => {
        if (!cancelled) setLoadedJobId(jobId)
      })
    return () => {
      cancelled = true
    }
  }, [open, jobId])

  function changeStatus(id: number, status: string) {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    startTransition(async () => {
      try {
        await updateApplicationStatus(id, status)
        toast.success("Status updated")
      } catch {
        toast.error("Could not update status")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Applicants</DialogTitle>
          <DialogDescription>{jobTitle}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : applicants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No applicants yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {applicants.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{a.applicantName}</p>
                    {a.headline && (
                      <p className="text-sm text-muted-foreground">{a.headline}</p>
                    )}
                    <a
                      href={`mailto:${a.applicantEmail}`}
                      className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {a.applicantEmail}
                    </a>
                  </div>
                  <Badge className={`capitalize ${STATUS_STYLES[a.status] ?? ""}`}>
                    {a.status}
                  </Badge>
                </div>

                {a.skills && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.skills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 6)
                      .map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs font-normal">
                          {s}
                        </Badge>
                      ))}
                  </div>
                )}

                {a.coverLetter && (
                  <p className="mt-3 whitespace-pre-line rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">
                    {a.coverLetter}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {a.cvUrl ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={a.cvUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View CV
                        <Download className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No CV attached</span>
                  )}
                  <div className="ml-auto">
                    <Select value={a.status} onValueChange={(v) => changeStatus(a.id, String(v))}>
                      <SelectTrigger className="h-9 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
