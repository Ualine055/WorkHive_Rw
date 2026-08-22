import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  active,
  action,
  children,
}: {
  title: string
  subtitle?: string
  nav: NavItem[]
  active: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {nav.map((item) => {
              const isActive = item.href === active
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
