import { Briefcase, PlusCircle, Building2 } from "lucide-react"
import type { NavItem } from "@/components/dashboard-shell"

export const employerNav: NavItem[] = [
  { href: "/employer", label: "My jobs", icon: <Briefcase className="h-4 w-4" /> },
  { href: "/employer/new", label: "Post a job", icon: <PlusCircle className="h-4 w-4" /> },
  { href: "/employer/profile", label: "Company", icon: <Building2 className="h-4 w-4" /> },
]
