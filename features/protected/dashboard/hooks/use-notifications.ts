"use client"

import { useEffect, useState } from "react"
import { NOTIFICATIONS_CHANGE_EVENT, readNotifications } from "@/lib/notifications-store"
import type { Notification } from "@/lib/types"

export function useNotifications(): Notification[] {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const sync = () => setNotifications(readNotifications())
    sync()
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return notifications
}
