"use client"

import { useEffect, useState } from "react"
import { ROOM_STATUS_CHANGE_EVENT, readRooms } from "@/lib/room-status-store"
import { rooms as seedRooms } from "@/lib/mock-data"
import type { Room } from "@/lib/types"

export function useRooms(): Room[] {
  const [rooms, setRooms] = useState<Room[]>(seedRooms)

  useEffect(() => {
    const sync = () => setRooms(readRooms())
    sync()
    window.addEventListener(ROOM_STATUS_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ROOM_STATUS_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return rooms
}
