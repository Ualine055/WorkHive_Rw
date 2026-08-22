"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { saveCompanyProfile } from "@/app/actions/profile"
import { toast } from "sonner"

type Company = {
  name: string | null
  website: string | null
  location: string | null
  about: string | null
} | null

export function CompanyProfileForm({ company }: { company: Company }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveCompanyProfile(new FormData(e.currentTarget))
      toast.success("Company profile saved")
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" defaultValue={company?.name ?? ""} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={company?.website ?? ""}
              placeholder="https://acme.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Headquarters</Label>
            <Input
              id="location"
              name="location"
              defaultValue={company?.location ?? ""}
              placeholder="San Francisco, CA"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="about">About the company</Label>
          <Textarea
            id="about"
            name="about"
            rows={5}
            defaultValue={company?.about ?? ""}
            placeholder="Tell candidates about your mission, culture, and team."
          />
        </div>
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
