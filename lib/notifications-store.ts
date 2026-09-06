import type { Notification } from "@/lib/types"

const STORAGE_KEY = "roomly_notifications"
export const NOTIFICATIONS_CHANGE_EVENT = "roomly-notifications-changed"

function readAll(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Notification[]) : []
  } catch {
    return []
  }
}

function writeAll(next: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGE_EVENT))
}

export function readNotifications(): Notification[] {
  return readAll()
}

export function appendNotification(entry: { message: string; link?: string }) {
  const record: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: entry.message,
    link: entry.link,
    read: false,
    createdAt: new Date().toISOString(),
  }
  writeAll([record, ...readAll()])
}

export function markNotificationRead(id: string) {
  writeAll(readAll().map((n) => (n.id === id ? { ...n, read: true } : n)))
}

export function markAllNotificationsRead() {
  writeAll(readAll().map((n) => ({ ...n, read: true })))
}

export function deleteNotification(id: string) {
  writeAll(readAll().filter((n) => n.id !== id))
}
