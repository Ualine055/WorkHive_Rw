import { LayoutList, UserRound, Search } from "lucide-react"
import type { NavItem } from "@/components/dashboard-shell"

export const seekerNav: NavItem[] = [
  { href: "/dashboard", label: "Applications", icon: <LayoutList className="h-4 w-4" /> },
  { href: "/dashboard/profile", label: "My profile", icon: <UserRound className="h-4 w-4" /> },
  { href: "/jobs", label: "Find jobs", icon: <Search className="h-4 w-4" /> },
]
