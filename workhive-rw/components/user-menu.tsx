"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, LayoutDashboard, User } from "lucide-react"
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
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-primary text-sm text-primary-foreground">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
