import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Compass, MapPin, Search, Sparkles, Users } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getJobs } from "@/app/actions/jobs"
import { JobCard } from "@/components/job-card"
import { JOB_CATEGORIES } from "@/lib/format"

export default async function HomePage() {
  const jobs = await getJobs()
  const featured = jobs.slice(0, 4)
  return <div className="min-h-svh bg-background"><SiteHeader /><main>
    <section className="soft-grid border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-6">
        <div className="flex flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent bg-accent/30 px-3 py-1.5 text-xs font-semibold text-accent-foreground"><Sparkles className="h-3.5 w-3.5" />A better way to find your next move</span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground text-balance md:text-6xl">Good work starts with the <span className="text-primary">right connection.</span></h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Discover thoughtful teams, meaningful roles, and opportunities that fit the way you want to work.</p>
          <form action="/jobs" className="mt-8 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 directory-shadow sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3"><Search className="h-5 w-5 text-primary" /><span className="sr-only">Search jobs</span><input name="q" className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Job title, skill, or company" /></label>
            <label className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3"><MapPin className="h-5 w-5 text-primary" /><span className="sr-only">Search location</span><input name="location" className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Location or remote" /></label>
            <Button type="submit" size="lg" className="rounded-xl"><Search className="mr-2 h-4 w-4" />Search jobs</Button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>Popular:</span>{JOB_CATEGORIES.slice(0, 4).map((category) => <Link key={category} href={`/jobs?category=${encodeURIComponent(category)}`} className="font-medium text-primary hover:underline">{category}</Link>)}</div>
        </div>
        <div className="relative hidden min-h-[330px] lg:block"><div className="absolute right-4 top-8 w-72 rotate-2 rounded-3xl border border-border bg-primary p-6 text-primary-foreground directory-shadow"><div className="flex items-center justify-between"><span className="rounded-xl bg-primary-foreground/15 p-3"><BriefcaseBusiness className="h-6 w-6" /></span><span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">Live now</span></div><p className="mt-10 text-sm text-primary-foreground/75">Open opportunities</p><p className="mt-1 text-5xl font-bold">{jobs.length}</p><p className="mt-4 text-sm text-primary-foreground/80">Roles from companies building what is next.</p></div><div className="absolute bottom-5 left-2 w-64 -rotate-3 rounded-3xl border border-border bg-card p-5 directory-shadow"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Users className="h-5 w-5" /></span><div><p className="text-sm font-semibold">People-first hiring</p><p className="text-xs text-muted-foreground">Built for real connection</p></div></div><div className="mt-5 flex -space-x-2"><span className="h-8 w-8 rounded-full border-2 border-card bg-primary/30" /><span className="h-8 w-8 rounded-full border-2 border-card bg-accent" /><span className="h-8 w-8 rounded-full border-2 border-card bg-chart-4" /><span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-bold">+2k</span></div></div></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6"><div className="grid gap-5 md:grid-cols-3"><Card className="p-5"><Compass className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Explore with clarity</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Useful filters and honest job details help you spend less time hunting.</p></Card><Card className="border-accent bg-accent/20 p-5"><CheckCircle2 className="h-6 w-6 text-accent-foreground" /><h2 className="mt-5 font-semibold">Apply with confidence</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Keep your profile and CV ready, then apply without repeating yourself.</p></Card><Card className="p-5"><Users className="h-6 w-6 text-primary" /><h2 className="mt-5 font-semibold">Meet better teams</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Employers get a simple workspace for thoughtful, organized hiring.</p></Card></div></section>
    {featured.length > 0 && <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-6"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-semibold text-primary">Fresh on WorkHive</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Roles worth a closer look</h2></div><Button asChild variant="outline"><Link href="/jobs">View all roles<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div><div className="grid gap-4 md:grid-cols-2">{featured.map((job) => <JobCard key={job.id} job={job} />)}</div></section>}
    <section className="border-y border-border bg-secondary/50"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 md:flex-row md:items-center lg:px-6"><div><p className="text-sm font-semibold text-primary">For growing teams</p><h2 className="mt-1 text-2xl font-bold">Your next great hire is looking too.</h2><p className="mt-2 text-sm text-muted-foreground">Post a role, meet qualified people, and keep every conversation organized.</p></div><Button asChild size="lg"><Link href="/sign-up">Start hiring<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></section>
  </main><footer className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground lg:px-6">WorkHive <span className="mx-2">·</span> Built for people and teams moving forward.</footer></div>
}
