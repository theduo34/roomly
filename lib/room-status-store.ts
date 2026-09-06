import { rooms as seedRooms } from "@/lib/mock-data"
import type { Room, RoomStatus } from "@/lib/types"

const STORAGE_KEY = "roomly_room_status"
export const ROOM_STATUS_CHANGE_EVENT = "roomly-room-status-changed"

function readOverrides(): Record<string, RoomStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, RoomStatus>) : {}
  } catch {
    return {}
  }
}

export function readRooms(): Room[] {
  const overrides = readOverrides()
  return seedRooms.map((room) => (overrides[room.id] ? { ...room, status: overrides[room.id] } : room))
}

export function setRoomStatus(roomId: string, status: RoomStatus) {
  const overrides = readOverrides()
  overrides[roomId] = status
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  window.dispatchEvent(new Event(ROOM_STATUS_CHANGE_EVENT))
}
