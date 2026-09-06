"use client"

import { toast } from "sonner"
import { UserPlusIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { staff } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { StaffRole, StaffStatus } from "@/lib/types"

const roleLabels: Record<StaffRole, string> = {
  receptionist: "Receptionist",
  manager: "Manager",
  director: "Director",
}

const statusStyles: Record<StaffStatus, string> = {
  on_shift: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  off_shift: "bg-muted text-muted-foreground",
}

const statusLabels: Record<StaffStatus, string> = {
  on_shift: "On shift",
  off_shift: "Off shift",
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatJoinDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value)
  )
}

export function StaffDirectory() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Staff directory</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toast.message("Inviting new staff isn't available in this demo.")}
        >
          <UserPlusIcon className="size-4" />
          Invite staff
        </Button>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border">
        {staff.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                {initialsOf(member.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email} · {member.phone}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Joined {formatJoinDate(member.joinedAt)}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {roleLabels[member.role]}
              </span>
              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", statusStyles[member.status])}>
                {statusLabels[member.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
