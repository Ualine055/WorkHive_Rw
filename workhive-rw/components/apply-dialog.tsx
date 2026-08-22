"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CvUpload, type UploadedCv } from "@/components/cv-upload"
import { applyToJob } from "@/app/actions/applications"
import { toast } from "sonner"

export function ApplyDialog({
  jobId,
  jobTitle,
  defaultCv,
}: {
  jobId: number
  jobTitle: string
  defaultCv: UploadedCv | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [cv, setCv] = useState<UploadedCv | null>(defaultCv)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("jobId", String(jobId))
      fd.set("coverLetter", coverLetter)
      if (cv) {
        fd.set("cvUrl", cv.url)
        fd.set("cvName", cv.name)
      }
      await applyToJob(fd)
      toast.success("Application submitted!")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not apply")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Send className="mr-2 h-4 w-4" />
          Apply now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            Attach your CV and add a short note to stand out.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>CV / Resume</Label>
            <CvUpload value={cv} onChange={setCv} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="coverLetter">Cover note (optional)</Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
