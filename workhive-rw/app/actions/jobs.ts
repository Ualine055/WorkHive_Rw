"use server"

import { db } from "@/lib/db"
import { job, application } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, desc, eq, ilike, or, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type JobFilters = {
  q?: string
  location?: string
  type?: string
  category?: string
}

export async function getJobs(filters: JobFilters = {}) {
  const conditions = [eq(job.status, "active")]

  if (filters.q) {
    conditions.push(
      or(
        ilike(job.title, `%${filters.q}%`),
        ilike(job.description, `%${filters.q}%`),
        ilike(job.companyName, `%${filters.q}%`),
      )!,
    )
  }
  if (filters.location) {
    conditions.push(ilike(job.location, `%${filters.location}%`))
  }
  if (filters.type && filters.type !== "all") {
    conditions.push(eq(job.type, filters.type))
  }
  if (filters.category && filters.category !== "all") {
    conditions.push(eq(job.category, filters.category))
  }

  return db
    .select()
    .from(job)
    .where(and(...conditions))
    .orderBy(desc(job.createdAt))
}

export async function getJobById(id: number) {
  const rows = await db.select().from(job).where(eq(job.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getEmployerJobs() {
  const user = await requireUser()
  const jobs = await db
    .select()
    .from(job)
    .where(eq(job.userId, user.id))
    .orderBy(desc(job.createdAt))

  // attach application counts
  const counts = await db
    .select({ jobId: application.jobId, total: count() })
    .from(application)
    .where(eq(application.employerId, user.id))
    .groupBy(application.jobId)

  const countMap = new Map(counts.map((c) => [c.jobId, Number(c.total)]))
  return jobs.map((j) => ({ ...j, applicantCount: countMap.get(j.id) ?? 0 }))
}

export async function createJob(formData: FormData) {
  const user = await requireUser()
  if (user.role !== "employer" && user.role !== "admin") {
    throw new Error("Only employers can post jobs")
  }

  const salaryMin = formData.get("salaryMin")
    ? Number(formData.get("salaryMin"))
    : null
  const salaryMax = formData.get("salaryMax")
    ? Number(formData.get("salaryMax"))
    : null

  await db.insert(job).values({
    userId: user.id,
    companyName: String(formData.get("companyName") || user.name),
    title: String(formData.get("title")),
    description: String(formData.get("description")),
    location: String(formData.get("location")),
    type: String(formData.get("type") || "Full-time"),
    category: String(formData.get("category") || "Other"),
    salaryMin,
    salaryMax,
  })

  revalidatePath("/employer")
  revalidatePath("/jobs")
}

/** Throws unless the signed-in user posted this job (admins may touch any job). */
async function requireJobOwner(id: number, user: { id: string; role: string }) {
  const rows = await db
    .select({ userId: job.userId })
    .from(job)
    .where(eq(job.id, id))
    .limit(1)

  if (!rows[0]) throw new Error("Job not found")
  if (user.role !== "admin" && rows[0].userId !== user.id) {
    throw new Error("You can only change your own jobs")
  }
}

export async function updateJob(id: number, formData: FormData) {
  const user = await requireUser()
  await requireJobOwner(id, user)

  await db
    .update(job)
    .set({
      companyName: String(formData.get("companyName") || user.name),
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      location: String(formData.get("location")),
      type: String(formData.get("type") || "Full-time"),
      category: String(formData.get("category") || "Other"),
      salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null,
      salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null,
      updatedAt: new Date(),
    })
    .where(eq(job.id, id))

  revalidatePath("/employer")
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${id}`)
}

export async function updateJobStatus(id: number, status: string) {
  const user = await requireUser()
  await requireJobOwner(id, user)

  await db
    .update(job)
    .set({ status, updatedAt: new Date() })
    .where(eq(job.id, id))

  revalidatePath("/employer")
  revalidatePath("/jobs")
}

export async function deleteJob(id: number) {
  const user = await requireUser()
  await requireJobOwner(id, user)

  await db.delete(application).where(eq(application.jobId, id))
  await db.delete(job).where(eq(job.id, id))

  revalidatePath("/employer")
  revalidatePath("/jobs")
  revalidatePath("/admin")
}
