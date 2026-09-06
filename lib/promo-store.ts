import { promoCodes as seedPromoCodes } from "@/lib/mock-data"
import type { PromoCode } from "@/lib/types"

const STORAGE_KEY = "roomly_promo_codes"
const OVERRIDES_KEY = "roomly_promo_overrides"
export const PROMO_CHANGE_EVENT = "roomly-promo-changed"

function readAdded(): PromoCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PromoCode[]) : []
  } catch {
    return []
  }
}

function readOverrides(): Record<string, { active: boolean }> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, { active: boolean }>) : {}
  } catch {
    return {}
  }
}

export function readPromoCodes(): PromoCode[] {
  const overrides = readOverrides()
  return [...readAdded(), ...seedPromoCodes].map((promo) =>
    overrides[promo.id] ? { ...promo, ...overrides[promo.id] } : promo
  )
}

function notify() {
  window.dispatchEvent(new Event(PROMO_CHANGE_EVENT))
}

export function createPromoCode(entry: { code: string; discountPercent: number }) {
  const record: PromoCode = {
    id: `promo-${Date.now()}`,
    code: entry.code.trim().toUpperCase(),
    discountPercent: entry.discountPercent,
    active: true,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readAdded()]))
  notify()
}

export function setPromoCodeActive(id: string, active: boolean) {
  const overrides = readOverrides()
  overrides[id] = { active }
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  notify()
}
