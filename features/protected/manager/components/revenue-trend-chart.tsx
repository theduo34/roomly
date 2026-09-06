"use client"

import { useMemo } from "react"
import { TrendChart } from "@/features/protected/dashboard/components/trend-chart"
import { formatCurrency } from "@/lib/utils"
import type { Booking } from "@/lib/types"

const DAYS = 14

function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}

function shortDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso))
}

export function RevenueTrendChart({ bookings }: { bookings: Booking[] }) {
  const { labels, values } = useMemo(() => {
    const days = lastNDays(DAYS)
    return {
      labels: days.map(shortDateLabel),
      values: days.map((iso) =>
        bookings
          .filter((b) => b.bookedAt.slice(0, 10) === iso && b.status !== "cancelled")
          .reduce((sum, b) => sum + b.depositPaid, 0)
      ),
    };
  }, [bookings])

  const total = values.reduce((sum, v) => sum + v, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">Revenue trend (last {DAYS} days)</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatCurrency(total)}</span> collected
        </p>
      </div>

      <div className="mt-2">
        <TrendChart
          labels={labels}
          series={[{ id: "revenue", label: "Revenue", color: "var(--chart-2)", values }]}
          formatValue={formatCurrency}
        />
      </div>
    </div>
  );
}
