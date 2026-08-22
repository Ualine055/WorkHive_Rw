import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { getSessionUser } from "@/lib/session"

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are allowed" },
      { status: 400 },
    )
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File must be under 5MB" },
      { status: 400 },
    )
  }

  const safeName = file.name.replace(/[^\w.-]+/g, "_")
  const key = `cvs/${user.id}/${Date.now()}-${safeName}`

  // Vercel Blob when a token is configured, otherwise store under public/uploads
  // so CV upload also works when running locally.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
    })
    return NextResponse.json({ url: blob.url, name: file.name })
  }

  const destination = path.join(process.cwd(), "public", "uploads", key)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${key}`, name: file.name })
}
