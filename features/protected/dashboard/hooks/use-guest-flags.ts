"use client"

import { useEffect, useState } from "react"
import { GUEST_FLAGS_CHANGE_EVENT, readGuestFlags } from "@/lib/guest-flags-store"
import type { GuestFlag } from "@/lib/types"

export function useGuestFlags(): Map<string, GuestFlag> {
  const [flags, setFlags] = useState<GuestFlag[]>([])

  useEffect(() => {
    const sync = () => setFlags(readGuestFlags())
    sync()
    window.addEventListener(GUEST_FLAGS_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(GUEST_FLAGS_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return new Map(flags.map((flag) => [flag.guestEmail, flag]))
}
