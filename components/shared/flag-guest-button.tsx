"use client"

import { useState } from "react"
import { toast } from "sonner"
import { FlagIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGuestFlags } from "@/features/protected/dashboard/hooks/use-guest-flags"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { appendAuditLog } from "@/lib/audit-log-store"
import { flagGuest, unflagGuest } from "@/lib/guest-flags-store"

export function FlagGuestButton({ email, name }: { email: string; name: string }) {
  const flags = useGuestFlags()
  const flag = flags.get(email)
  const staffName = useStaffName()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  function submitFlag() {
    const value = reason.trim()
    if (!value) return
    flagGuest(email, value, staffName || "Receptionist")
    appendAuditLog({
      action: `Flagged guest profile — ${name}: ${value}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.success(`${name}'s profile has been flagged.`)
    setReason("")
    setOpen(false)
  }

  function removeFlag() {
    unflagGuest(email)
    appendAuditLog({
      action: `Removed flag from guest profile — ${name}`,
      performedBy: staffName || "Receptionist",
      role: "receptionist",
    })
    toast.message(`Flag removed for ${name}.`)
  }

  if (flag) {
    return (
      <button
        type="button"
        onClick={removeFlag}
        title={`Flagged: ${flag.reason}`}
        className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20"
      >
        <FlagIcon weight="fill" size={12} />
        Flagged
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Flag this guest for behavioural reasons"
        className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
      >
        <FlagIcon size={12} />
        Flag
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag {name}</DialogTitle>
            <DialogDescription>
              Staff will be alerted on future bookings or visits from this guest.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Disruptive conduct during previous stay, property damage…"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitFlag} disabled={!reason.trim()}>
              Flag guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
