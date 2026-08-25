import Link from "next/link"
import { BriefcaseBusiness, Compass, PenLine, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { getSessionUser } from "@/lib/session"

export async function SiteHeader() {
  const user = await getSessionUser()
  const dashboardHref = user?.role === "admin" ? "/admin" : user?.role === "employer" ? "/employer" : "/dashboard"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">Work<span className="text-primary">Hive</span></span>
        </Link>
        <form
          action="/jobs"
          className="hidden h-9 max-w-md flex-1 items-center rounded-xl border border-border bg-secondary/60 px-3 text-sm md:flex"
        >
          <Search className="mr-2 h-4 w-4 shrink-0 text-primary" />
          <label htmlFor="header-search" className="sr-only">
            Search jobs
          </label>
          <input
            id="header-search"
            name="q"
            placeholder="Search jobs, companies, skills..."
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </form>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm"><Link href="/jobs"><Compass className="mr-2 h-4 w-4 text-primary" />Explore jobs</Link></Button>
          {user && <Button asChild variant="ghost" size="sm"><Link href={dashboardHref}>Dashboard</Link></Button>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? <UserMenu name={user.name} email={user.email} role={user.role ?? "seeker"} /> : <><Button asChild variant="ghost" size="sm"><Link href="/sign-in">Sign in</Link></Button><Button asChild size="sm"><Link href="/sign-up"><PenLine className="mr-2 h-4 w-4" />Join WorkHive</Link></Button></>}
        </div>
      </div>
    </header>
  )
}
