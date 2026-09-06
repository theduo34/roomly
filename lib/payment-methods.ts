import type { PaymentMethod } from "@/lib/types"

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Card",
  mobile_money: "Mobile Money",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
}

export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
]
