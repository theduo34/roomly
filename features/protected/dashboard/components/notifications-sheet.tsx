"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BellIcon, CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react/ssr"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useNotifications } from "@/features/protected/dashboard/hooks/use-notifications"
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from "@/lib/notifications-store"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 6

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function NotificationsSheet() {
  const { dashboardToken } = useParams<{ dashboardToken: string }>()
  const router = useRouter()
  const notifications = useNotifications()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)

  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const unreadCount = sorted.filter((n) => !n.read).length
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = sorted.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  function handleOpen(next: boolean) {
    setOpen(next)
    if (!next) setPage(0)
  }

  function handleClick(id: string, link?: string) {
    markNotificationRead(id)
    if (link) {
      handleOpen(false)
      router.push(link.startsWith("/admin") ? link : `/admin/${dashboardToken}${link}`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <BellIcon size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex size-2 rounded-full bg-destructive" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader className="flex-row items-center justify-between border-b border-border">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllNotificationsRead()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </SheetHeader>
        <ul className="flex flex-1 flex-col divide-y divide-border overflow-y-auto px-4">
          {pageItems.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">No notifications yet.</li>
          ) : (
            pageItems.map((notification) => (
              <li key={notification.id} className="group flex items-start gap-2 py-3">
                <button
                  type="button"
                  onClick={() => handleClick(notification.id, notification.link)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      notification.read ? "bg-transparent" : "bg-primary"
                    )}
                  />
                  <div className="min-w-0">
                    <p className={cn("text-sm", notification.read ? "text-muted-foreground" : "font-medium text-foreground")}>
                      {notification.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(notification.createdAt)}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => deleteNotification(notification.id)}
                  aria-label="Delete notification"
                  className="shrink-0 rounded-full p-1 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100"
                >
                  <XIcon size={14} />
                </button>
              </li>
            ))
          )}
        </ul>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                aria-label="Previous page"
              >
                <CaretLeftIcon size={12} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                aria-label="Next page"
              >
                <CaretRightIcon size={12} />
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
