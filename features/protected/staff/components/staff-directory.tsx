"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CaretLeftIcon, CaretRightIcon, MagnifyingGlassIcon, UserPlusIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { staff } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { StaffRole, StaffStatus } from "@/lib/types"

const PAGE_SIZE = 8

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
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return staff.filter((member) => !q || `${member.name} ${member.email}`.toLowerCase().includes(q))
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageStaff = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="relative mt-4 max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff by name or email"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          className="pl-9"
        />
      </div>

      {pageStaff.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No staff match your search.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {pageStaff.map((member) => (
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
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    statusStyles[member.status]
                  )}
                >
                  {statusLabels[member.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <CaretLeftIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
