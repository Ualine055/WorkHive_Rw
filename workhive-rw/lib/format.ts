export function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`
  }
  return "just now"
}

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"]

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "Finance",
  "Operations",
  "Other",
]

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewing: "bg-accent text-accent-foreground",
  shortlisted: "bg-chart-2/15 text-chart-2",
  accepted: "bg-chart-3/15 text-chart-3",
  rejected: "bg-destructive/10 text-destructive",
}
