"use client"

import { useDashboardRole } from "@/features/protected/dashboard/context/role-context"
import { RoomStatusBoard } from "@/features/protected/rooms/components/room-status-board"

export function RoomsView() {
  const role = useDashboardRole()
  return <RoomStatusBoard editable={role === "receptionist"} />;
}
