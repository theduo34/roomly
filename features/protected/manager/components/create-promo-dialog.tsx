"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useStaffName } from "@/features/auth/hooks/use-role"
import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { appendAuditLog } from "@/lib/audit-log-store"
import { createPromoCode } from "@/lib/promo-store"

export function CreatePromoDialog() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState("10")
  const staffName = useStaffName()
  const role = useDashboardRole()

  function submit() {
    const trimmedCode = code.trim()
    const discountPercent = Number(discount)
    if (!trimmedCode || !Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return

    createPromoCode({ code: trimmedCode, discountPercent })
    appendAuditLog({
      action: `Created promo code ${trimmedCode.toUpperCase()} (${discountPercent}% off)`,
      performedBy: staffName || "Manager",
      role,
    })
    toast.success(`Promo code ${trimmedCode.toUpperCase()} is now active.`)
    setCode("")
    setDiscount("10")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PlusIcon className="size-4" />
          Create code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create promo code</DialogTitle>
          <DialogDescription>New codes start active immediately.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promo-code">Code</Label>
            <Input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promo-discount">Discount %</Label>
            <Input
              id="promo-discount"
              type="number"
              min={1}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!code.trim()}>
            Create code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
