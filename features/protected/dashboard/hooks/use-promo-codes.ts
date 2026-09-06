"use client"

import { useEffect, useState } from "react"
import { PROMO_CHANGE_EVENT, readPromoCodes } from "@/lib/promo-store"
import type { PromoCode } from "@/lib/types"

export function usePromoCodes(): PromoCode[] {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])

  useEffect(() => {
    const sync = () => setPromoCodes(readPromoCodes())
    sync()
    window.addEventListener(PROMO_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(PROMO_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return promoCodes
}
