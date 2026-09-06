"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "roomly_saved"
const CHANGE_EVENT = "roomly-saved-changed"

function readSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeSavedIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useSavedRooms() {
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setSavedIds(readSavedIds())
    sync()
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const toggle = useCallback((roomId: string) => {
    const current = readSavedIds()
    const next = current.includes(roomId)
      ? current.filter((id) => id !== roomId)
      : [...current, roomId]
    writeSavedIds(next)
  }, [])

  const isSaved = useCallback((roomId: string) => savedIds.includes(roomId), [savedIds])

  return { savedIds, isSaved, toggle }
}
