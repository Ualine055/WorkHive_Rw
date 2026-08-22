import Link from "next/link"
import { Banknote, Briefcase, Clock3, MapPin, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatSalary, timeAgo } from "@/lib/format"

type Job = { id: number; title: string; companyName: string; location: string; type: string; category: string; salaryMin: number | null; salaryMax: number | null; createdAt: Date | string }

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax)
  return <Link href={`/jobs/${job.id}`} className="group block"><Card className="directory-shadow h-full border-transparent p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"><div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{job.companyName.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="truncate font-semibold text-foreground group-hover:text-primary">{job.title}</h3><p className="mt-0.5 text-sm text-muted-foreground">{job.companyName}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /></div><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{job.location}</span><span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-primary" />{job.category}</span>{salary && <span className="flex items-center gap-1 font-medium text-foreground"><Banknote className="h-3.5 w-3.5 text-primary" />{salary}</span>}</div></div><Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">{job.type}</Badge></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{timeAgo(job.createdAt)}</span><span className="font-semibold text-primary">View role</span></div></Card></Link>
}
