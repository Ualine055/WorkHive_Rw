"use server"

import { db } from "@/lib/db"
import { seekerProfile, companyProfile } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ---------------- Seeker profile ----------------

export async function getSeekerProfile() {
  const user = await requireUser()
  const rows = await db
    .select()
    .from(seekerProfile)
    .where(eq(seekerProfile.userId, user.id))
    .limit(1)
  return rows[0] ?? null
}

export async function saveSeekerProfile(formData: FormData) {
  const user = await requireUser()
  const data = {
    headline: String(formData.get("headline") || ""),
    bio: String(formData.get("bio") || ""),
    location: String(formData.get("location") || ""),
    skills: String(formData.get("skills") || ""),
    experience: String(formData.get("experience") || ""),
    cvUrl: formData.get("cvUrl") ? String(formData.get("cvUrl")) : null,
    cvName: formData.get("cvName") ? String(formData.get("cvName")) : null,
    updatedAt: new Date(),
  }

  const existing = await db
    .select({ id: seekerProfile.id })
    .from(seekerProfile)
    .where(eq(seekerProfile.userId, user.id))
    .limit(1)

  if (existing[0]) {
    // Keep existing CV if a new one wasn't uploaded
    const patch = { ...data }
    if (!patch.cvUrl) {
      delete (patch as Record<string, unknown>).cvUrl
      delete (patch as Record<string, unknown>).cvName
    }
    await db
      .update(seekerProfile)
      .set(patch)
      .where(eq(seekerProfile.userId, user.id))
  } else {
    await db.insert(seekerProfile).values({ userId: user.id, ...data })
  }

  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard")
}

// ---------------- Company profile ----------------

/** The public company details shown next to a job listing. */
export async function getCompanyProfileByUserId(userId: string) {
  const rows = await db
    .select()
    .from(companyProfile)
    .where(eq(companyProfile.userId, userId))
    .limit(1)
  return rows[0] ?? null
}

export async function getCompanyProfile() {
  const user = await requireUser()
  const rows = await db
    .select()
    .from(companyProfile)
    .where(eq(companyProfile.userId, user.id))
    .limit(1)
  return rows[0] ?? null
}

export async function saveCompanyProfile(formData: FormData) {
  const user = await requireUser()
  const data = {
    name: String(formData.get("name") || user.name),
    website: String(formData.get("website") || ""),
    location: String(formData.get("location") || ""),
    about: String(formData.get("about") || ""),
    updatedAt: new Date(),
  }

  const existing = await db
    .select({ id: companyProfile.id })
    .from(companyProfile)
    .where(eq(companyProfile.userId, user.id))
    .limit(1)

  if (existing[0]) {
    await db
      .update(companyProfile)
      .set(data)
      .where(eq(companyProfile.userId, user.id))
  } else {
    await db.insert(companyProfile).values({ userId: user.id, ...data })
  }

  revalidatePath("/employer/profile")
}
