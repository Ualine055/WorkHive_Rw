"use server"

import { db } from "@/lib/db"
import {
  user as userTable,
  job,
  application,
  companyProfile,
  seekerProfile,
} from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { desc, eq, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "admin") throw new Error("Forbidden")
  return user
}

export async function getAdminStats() {
  await requireAdmin()
  const [users] = await db.select({ total: count() }).from(userTable)
  const [jobs] = await db.select({ total: count() }).from(job)
  const [apps] = await db.select({ total: count() }).from(application)
  return {
    users: Number(users?.total ?? 0),
    jobs: Number(jobs?.total ?? 0),
    applications: Number(apps?.total ?? 0),
  }
}

export async function getAllUsers() {
  await requireAdmin()
  return db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt))
}

export async function getAllJobs() {
  await requireAdmin()
  return db.select().from(job).orderBy(desc(job.createdAt))
}

export async function setUserRole(userId: string, role: string) {
  await requireAdmin()
  await db
    .update(userTable)
    .set({ role, updatedAt: new Date() })
    .where(eq(userTable.id, userId))
  revalidatePath("/admin")
}

export async function deleteUser(userId: string) {
  await requireAdmin()

  // Applications first, so no row is left pointing at a job that is about to go.
  await db.delete(application).where(eq(application.seekerId, userId))
  await db.delete(application).where(eq(application.employerId, userId))
  await db.delete(job).where(eq(job.userId, userId))
  await db.delete(companyProfile).where(eq(companyProfile.userId, userId))
  await db.delete(seekerProfile).where(eq(seekerProfile.userId, userId))
  await db.delete(userTable).where(eq(userTable.id, userId))

  revalidatePath("/admin")
  revalidatePath("/jobs")
}

export async function adminDeleteJob(jobId: number) {
  await requireAdmin()
  await db.delete(application).where(eq(application.jobId, jobId))
  await db.delete(job).where(eq(job.id, jobId))
  revalidatePath("/admin")
}
