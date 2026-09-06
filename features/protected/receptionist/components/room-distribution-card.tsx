"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DonutChart } from "@/features/protected/dashboard/components/donut-chart"

const periodOptions = ["Today", "This week", "This month"]

const periodLabel: Record<string, string> = {
  Today: "Today",
  "This week": "Weekly",
  "This month": "Monthly",
}

type Segment = {
  id: string
  label: string
  value: number
  color: string
}

export function RoomDistributionCard({
  segments,
  centerLabel,
  activeFilter,
}: {
  segments: Segment[]
  centerLabel: string
  activeFilter: string
}) {
  // Follows the dashboard's top-level filter by default, but can be overridden just for this card.
  const [prevActiveFilter, setPrevActiveFilter] = useState(activeFilter)
  const [period, setPeriod] = useState(activeFilter)
  if (activeFilter !== prevActiveFilter) {
    setPrevActiveFilter(activeFilter)
    setPeriod(activeFilter)
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-base font-semibold text-foreground">Room distribution</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger size="sm" className="w-28 text-xs">
            <SelectValue>{periodLabel[period] ?? "Weekly"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {periodLabel[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <DonutChart segments={segments} centerLabel={centerLabel} />
      </div>
    </div>
  );
}
