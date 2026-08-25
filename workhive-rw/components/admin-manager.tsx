"use client"

import { useState, useTransition } from "react"
import { Trash2, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { setUserRole, deleteUser, adminDeleteJob } from "@/app/actions/admin"
import { timeAgo } from "@/lib/format"
import { toast } from "sonner"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date | string
}

type AdminJob = {
  id: number
  title: string
  companyName: string
  location: string
  status: string
  createdAt: Date | string
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  employer: "bg-chart-2/15 text-chart-2",
  seeker: "bg-muted text-muted-foreground",
}

export function AdminManager({
  users,
  jobs,
  currentUserId,
}: {
  users: AdminUser[]
  jobs: AdminJob[]
  currentUserId: string
}) {
  const [userList, setUserList] = useState(users)
  const [jobList, setJobList] = useState(jobs)
  const [, startTransition] = useTransition()

  function changeRole(id: string, role: string) {
    setUserList((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    startTransition(async () => {
      try {
        await setUserRole(id, role)
        toast.success("Role updated")
      } catch {
        toast.error("Could not update role")
      }
    })
  }

  function removeUser(id: string) {
    setUserList((prev) => prev.filter((u) => u.id !== id))
    startTransition(async () => {
      try {
        await deleteUser(id)
        toast.success("User removed")
      } catch {
        toast.error("Could not remove user")
      }
    })
  }

  function removeJob(id: number) {
    setJobList((prev) => prev.filter((j) => j.id !== id))
    startTransition(async () => {
      try {
        await adminDeleteJob(id)
        toast.success("Job removed")
      } catch {
        toast.error("Could not remove job")
      }
    })
  }

  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users ({userList.length})</TabsTrigger>
        <TabsTrigger value="jobs">Jobs ({jobList.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-4">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((u) => {
                  const isSelf = u.id === currentUserId
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        {isSelf ? (
                          <Badge className={ROLE_STYLES[u.role]}>
                            <Shield className="mr-1 h-3 w-3" />
                            {u.role}
                          </Badge>
                        ) : (
                          <Select value={u.role} onValueChange={(v) => changeRole(u.id, String(v))}>
                            <SelectTrigger className="h-8 w-32 capitalize">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="seeker">Seeker</SelectItem>
                              <SelectItem value="employer">Employer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {timeAgo(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={isSelf}
                          onClick={() => removeUser(u.id)}
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="jobs" className="mt-4">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobList.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{j.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {j.companyName} · {j.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={j.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {j.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {timeAgo(j.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeJob(j.id)}
                        aria-label="Delete job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
