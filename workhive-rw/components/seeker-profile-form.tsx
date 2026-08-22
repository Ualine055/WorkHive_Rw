"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CvUpload, type UploadedCv } from "@/components/cv-upload"
import { saveSeekerProfile } from "@/app/actions/profile"
import { toast } from "sonner"

type Profile = {
  headline: string | null
  bio: string | null
  location: string | null
  skills: string | null
  experience: string | null
  cvUrl: string | null
  cvName: string | null
} | null

export function SeekerProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [cv, setCv] = useState<UploadedCv | null>(
    profile?.cvUrl && profile?.cvName ? { url: profile.cvUrl, name: profile.cvName } : null,
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData(e.currentTarget)
      if (cv) {
        fd.set("cvUrl", cv.url)
        fd.set("cvName", cv.name)
      }
      await saveSeekerProfile(fd)
      toast.success("Profile saved")
      router.refresh()
    } catch {
      toast.error("Could not save profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-foreground">Basic information</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="headline">Professional headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile?.headline ?? ""}
            placeholder="Senior Frontend Engineer"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={profile?.location ?? ""}
            placeholder="Berlin, Germany or Remote"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">About you</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio ?? ""}
            rows={4}
            placeholder="A short summary of who you are and what you're looking for."
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-foreground">Skills & experience</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="skills">Skills</Label>
          <Input
            id="skills"
            name="skills"
            defaultValue={profile?.skills ?? ""}
            placeholder="React, TypeScript, Node.js (comma separated)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="experience">Experience</Label>
          <Textarea
            id="experience"
            name="experience"
            defaultValue={profile?.experience ?? ""}
            rows={4}
            placeholder="Summarize your work history."
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="font-semibold text-foreground">CV / Resume</h2>
          <p className="text-sm text-muted-foreground">
            Uploaded once, reused for every application.
          </p>
        </div>
        <CvUpload value={cv} onChange={setCv} />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save profile
        </Button>
      </div>
    </form>
  )
}
