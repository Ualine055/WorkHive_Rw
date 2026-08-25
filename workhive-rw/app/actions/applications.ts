"use server"

import { db } from "@/lib/db"
import { application, job, user as userTable, seekerProfile } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function applyToJob(formData: FormData) {
  const user = await requireUser()
  if (user.role !== "seeker") {
    throw new Error("Only job seekers can apply")
  }

  const jobId = Number(formData.get("jobId"))
  const jobRows = await db.select().from(job).where(eq(job.id, jobId)).limit(1)
  const targetJob = jobRows[0]
  if (!targetJob) throw new Error("Job not found")

  // Prevent duplicate applications
  const existing = await db
    .select()
    .from(application)
    .where(and(eq(application.jobId, jobId), eq(application.seekerId, user.id)))
    .limit(1)
  if (existing[0]) throw new Error("You have already applied to this job")

  await db.insert(application).values({
    jobId,
    seekerId: user.id,
    employerId: targetJob.userId,
    coverLetter: String(formData.get("coverLetter") || ""),
    cvUrl: formData.get("cvUrl") ? String(formData.get("cvUrl")) : null,
    cvName: formData.get("cvName") ? String(formData.get("cvName")) : null,
  })

  revalidatePath("/dashboard")
  revalidatePath(`/jobs/${jobId}`)
}

export async function hasApplied(jobId: number) {
  const user = await requireUser()
  const existing = await db
    .select({ id: application.id })
    .from(application)
    .where(and(eq(application.jobId, jobId), eq(application.seekerId, user.id)))
    .limit(1)
  return Boolean(existing[0])
}

export async function getMyApplications() {
  const user = await requireUser()
  return db
    .select({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      coverLetter: application.coverLetter,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      location: job.location,
      jobStatus: job.status,
    })
    .from(application)
    .innerJoin(job, eq(application.jobId, job.id))
    .where(eq(application.seekerId, user.id))
    .orderBy(desc(application.createdAt))
}

export async function getApplicantsForJob(jobId: number) {
  const user = await requireUser()
  // Ensure the job belongs to this employer
  const owned = await db
    .select({ id: job.id })
    .from(job)
    .where(and(eq(job.id, jobId), eq(job.userId, user.id)))
    .limit(1)
  if (!owned[0] && user.role !== "admin") throw new Error("Unauthorized")

  return db
    .select({
      id: application.id,
      status: application.status,
      coverLetter: application.coverLetter,
      cvUrl: application.cvUrl,
      cvName: application.cvName,
      createdAt: application.createdAt,
      applicantName: userTable.name,
      applicantEmail: userTable.email,
      headline: seekerProfile.headline,
      skills: seekerProfile.skills,
    })
    .from(application)
    .innerJoin(userTable, eq(application.seekerId, userTable.id))
    .leftJoin(seekerProfile, eq(seekerProfile.userId, application.seekerId))
    .where(eq(application.jobId, jobId))
    .orderBy(desc(application.createdAt))
}

export async function withdrawApplication(id: number) {
  const user = await requireUser()

  await db
    .delete(application)
    .where(and(eq(application.id, id), eq(application.seekerId, user.id)))

  revalidatePath("/dashboard")
}

export async function updateApplicationStatus(id: number, status: string) {
  const user = await requireUser()
  await db
    .update(application)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(application.id, id), eq(application.employerId, user.id)))
  revalidatePath("/employer")
}
