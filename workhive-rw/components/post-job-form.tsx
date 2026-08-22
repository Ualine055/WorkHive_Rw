"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createJob } from "@/app/actions/jobs"
import { JOB_TYPES, JOB_CATEGORIES } from "@/lib/format"
import { toast } from "sonner"

export function PostJobForm({ defaultCompany }: { defaultCompany: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState("Full-time")
  const [category, setCategory] = useState("Engineering")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set("type", type)
      fd.set("category", category)
      await createJob(fd)
      toast.success("Job posted")
      router.push("/employer")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post job")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Job title</Label>
          <Input id="title" name="title" required placeholder="Senior Product Designer" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={defaultCompany}
            required
            placeholder="Acme Inc."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" required placeholder="Remote / New York" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Job type</Label>
            <Select value={type} onValueChange={(v) => setType(String(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2 sm:col-span-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(String(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="salaryMin">Min salary (USD)</Label>
            <Input id="salaryMin" name="salaryMin" type="number" min="0" placeholder="60000" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="salaryMax">Max salary (USD)</Label>
            <Input id="salaryMax" name="salaryMax" type="number" min="0" placeholder="90000" />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-2 p-6">
        <Label htmlFor="description">Job description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={10}
          placeholder="Describe the role, responsibilities, requirements, and benefits..."
        />
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/employer")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish job
        </Button>
      </div>
    </form>
  )
}
