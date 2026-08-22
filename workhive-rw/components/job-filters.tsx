"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JOB_TYPES, JOB_CATEGORIES } from "@/lib/format"

export function JobFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [q, setQ] = useState(params.get("q") ?? "")
  const [location, setLocation] = useState(params.get("location") ?? "")
  const [type, setType] = useState(params.get("type") ?? "all")
  const [category, setCategory] = useState(params.get("category") ?? "all")

  function apply(next?: Partial<{ type: string; category: string }>) {
    const sp = new URLSearchParams()
    if (q) sp.set("q", q)
    if (location) sp.set("location", location)
    const t = next?.type ?? type
    const c = next?.category ?? category
    if (t && t !== "all") sp.set("type", t)
    if (c && c !== "all") sp.set("category", c)
    router.push(`/jobs?${sp.toString()}`)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        apply()
      }}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Keyword</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, company, or skill"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or Remote"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Type</label>
        <Select
          value={type}
          onValueChange={(v) => {
            const next = String(v)
            setType(next)
            apply({ type: next })
          }}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any type</SelectItem>
            {JOB_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select
          value={category}
          onValueChange={(v) => {
            const next = String(v)
            setCategory(next)
            apply({ category: next })
          }}
        >
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any category</SelectItem>
            {JOB_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="md:mb-0">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  )
}
