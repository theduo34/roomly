"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PolicySettings() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">Policy settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Changes here are for demo purposes only and are not saved.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="depositPercent">Deposit (%)</Label>
          <Input id="depositPercent" type="number" defaultValue={20} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="penaltyPercent">Cancellation penalty (%)</Label>
          <Input id="penaltyPercent" type="number" defaultValue={5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cancellationWindow">Cancellation window (hours)</Label>
          <Input id="cancellationWindow" type="number" defaultValue={48} />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-5"
        onClick={() => toast("Settings are read-only in this demo.")}
      >
        Save changes
      </Button>
    </div>
  );
}
