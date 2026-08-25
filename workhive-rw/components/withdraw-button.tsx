"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { withdrawApplication } from "@/app/actions/applications"
import { toast } from "sonner"

export function WithdrawButton({ applicationId }: { applicationId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function withdraw() {
    startTransition(async () => {
      try {
        await withdrawApplication(applicationId)
        toast.success("Application withdrawn")
        router.refresh()
      } catch {
        toast.error("Could not withdraw application")
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={withdraw}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive"
    >
      <X className="mr-1 h-3.5 w-3.5" />
      Withdraw
    </Button>
  )
}
