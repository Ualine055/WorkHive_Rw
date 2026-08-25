"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, LayoutDashboard, User, UserRound, ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roleLabels: Record<string, string> = {
  seeker: "Job Seeker",
  employer: "Employer",
  admin: "Administrator",
}

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: string
}) {
  const router = useRouter()

  const dashboardHref =
    role === "admin" ? "/admin" : role === "employer" ? "/employer" : "/dashboard"

  const profileHref =
    role === "employer" ? "/employer/profile" : role === "seeker" ? "/dashboard/profile" : null

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border py-1 pr-2.5 pl-1 outline-none transition-colors hover:bg-secondary">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials || <User className="h-3.5 w-3.5" />}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
          {name.split(" ")[0]}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">{email}</span>
          <Badge variant="secondary" className="mt-1 w-fit">
            {roleLabels[role] ?? role}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        {profileHref && (
          <DropdownMenuItem asChild>
            <Link href={profileHref} className="cursor-pointer">
              <UserRound className="mr-2 h-4 w-4" />
              My profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
