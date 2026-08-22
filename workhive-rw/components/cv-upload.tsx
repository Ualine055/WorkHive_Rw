"use client"

import { useRef, useState } from "react"
import { Upload, FileText, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export type UploadedCv = { url: string; name: string }

export function CvUpload({
  value,
  onChange,
}: {
  value: UploadedCv | null
  onChange: (cv: UploadedCv | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB")
      return
    }
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/upload-cv", { method: "POST", body })
      if (!res.ok) throw new Error("Upload failed")
      const data = (await res.json()) as UploadedCv
      onChange(data)
      toast.success("CV uploaded")
    } catch {
      toast.error("Could not upload CV. Try again.")
    } finally {
      setUploading(false)
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate text-sm text-foreground">{value.name}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onChange(null)}
          aria-label="Remove CV"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-secondary/40 disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-foreground">
          {uploading ? "Uploading..." : "Upload your CV"}
        </span>
        <span className="text-xs text-muted-foreground">PDF, up to 5MB</span>
      </button>
    </>
  )
}
