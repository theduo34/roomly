"use client"

import { useId, useState } from "react"
import { cn } from "@/lib/utils"

export type TrendSeries = {
  id: string
  label: string
  color: string // CSS color value, e.g. "var(--chart-2)"
  values: number[]
}

export type TrendLabel = {
  label: string
  sublabel?: string
  /** Full date/period shown in the tooltip title instead of the compact axis label — e.g. "12th September 2026". */
  fullLabel?: string
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 180
const PADDING_LEFT = 32
const PADDING_RIGHT = 16
const PADDING_TOP = 16
const PADDING_BOTTOM = 34
const Y_TICKS = 4

function niceMax(value: number): number {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function TrendChart({
  labels,
  series,
  formatValue = (n: number) => String(n),
  defaultIndex,
  fillHeight = false,
  percentOf,
}: {
  labels: (string | TrendLabel)[]
  series: TrendSeries[]
  formatValue?: (value: number) => string
  /** Index to highlight when the chart isn't being hovered — defaults to the current/latest point. */
  defaultIndex?: number
  /** Stretch to fill the parent's height instead of keeping a fixed aspect ratio — use inside a flex/h-full container. */
  fillHeight?: boolean
  /** When set, the tooltip also shows each series value as a percentage of this total. */
  percentOf?: number
}) {
  const gradientBase = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const normalizedLabels: TrendLabel[] = labels.map((l) => (typeof l === "string" ? { label: l } : l))
  const maxValue = niceMax(Math.max(1, ...series.flatMap((s) => s.values)))
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const stepX = normalizedLabels.length > 1 ? plotWidth / (normalizedLabels.length - 1) : 0
  const baselineY = PADDING_TOP + plotHeight
  const fallbackIndex = defaultIndex ?? normalizedLabels.length - 1

  const yToPixel = (value: number) => PADDING_TOP + plotHeight - (value / maxValue) * plotHeight
  const xToPixel = (i: number) => PADDING_LEFT + stepX * i

  const seriesCoords = series.map((s) => ({
    ...s,
    points: s.values.map((value, i) => ({ value, x: xToPixel(i), y: yToPixel(value) })),
  }))

  const activeIndex = hoverIndex ?? fallbackIndex
  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => Math.round((maxValue / Y_TICKS) * i))

  // Crosshair meets the line at whichever series peaks highest for this index.
  const peakSeries = seriesCoords.reduce((peak, s) => (s.points[activeIndex].y < peak.points[activeIndex].y ? s : peak), seriesCoords[0])
  const peakPoint = peakSeries?.points[activeIndex]

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const index = Math.round(ratio * (normalizedLabels.length - 1))
    setHoverIndex(Math.min(normalizedLabels.length - 1, Math.max(0, index)))
  }

  const tooltipLeft = clamp((xToPixel(activeIndex) / CHART_WIDTH) * 100, 12, 88)
  const tooltipTop = peakPoint ? clamp((peakPoint.y / CHART_HEIGHT) * 100, 0, 100) : 0

  return (
    <div className={fillHeight ? "flex h-full flex-col" : undefined}>
      <span className="sr-only">
        {series
          .map((s) => `${s.label}: ${normalizedLabels.map((l, i) => `${l.label} ${s.values[i]}`).join(", ")}`)
          .join(". ")}
      </span>

      <div
        className={cn("relative w-full", fillHeight ? "h-full min-h-[180px] flex-1" : undefined)}
        style={fillHeight ? undefined : { aspectRatio: `${CHART_WIDTH} / ${CHART_HEIGHT}` }}
      >
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio={fillHeight ? "none" : undefined}
          className="absolute inset-0 h-full w-full touch-none"
          role="img"
          aria-hidden="true"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            {seriesCoords.map((s) => (
              <linearGradient key={s.id} id={`${gradientBase}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {yTicks.map((tick) => {
            const y = yToPixel(tick)
            return (
              <g key={tick}>
                <line x1={PADDING_LEFT} y1={y} x2={CHART_WIDTH - PADDING_RIGHT} y2={y} stroke="var(--border)" strokeWidth={1} opacity={tick === 0 ? 1 : 0.5} />
                <text x={PADDING_LEFT - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
                  {tick}
                </text>
              </g>
            );
          })}

          {peakPoint && (
            <g>
              {/* Crosshair — meets the line at the active point, always visible so the chart reads "as of now" */}
              <line
                x1={xToPixel(activeIndex)}
                y1={PADDING_TOP}
                x2={xToPixel(activeIndex)}
                y2={baselineY}
                stroke="var(--foreground)"
                strokeOpacity={0.35}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <line
                x1={PADDING_LEFT}
                y1={peakPoint.y}
                x2={peakPoint.x}
                y2={peakPoint.y}
                stroke="var(--foreground)"
                strokeOpacity={0.35}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          )}

          {seriesCoords.map((s) => {
            const line = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
            const gradientId = `${gradientBase}-${s.id}`
            const active = s.points[activeIndex]

            return (
              <g key={s.id}>
                <path
                  d={`${line} L${s.points[s.points.length - 1].x},${baselineY} L${s.points[0].x},${baselineY} Z`}
                  fill={`url(#${gradientId})`}
                  stroke="none"
                />
                <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={active.x} cy={active.y} r={5} fill={s.color} stroke="var(--card)" strokeWidth={2} />
              </g>
            );
          })}

          {normalizedLabels.map((item, i) => {
            const labelStep = Math.ceil(normalizedLabels.length / 7)
            if (i % labelStep !== 0 && i !== normalizedLabels.length - 1 && i !== activeIndex) return null
            const isActive = i === activeIndex
            return (
              <g key={item.label + i}>
                <text
                  x={xToPixel(i)}
                  y={CHART_HEIGHT - (item.sublabel ? 20 : 8)}
                  textAnchor="middle"
                  className={cn("text-[10px]", isActive ? "fill-primary font-bold" : "fill-foreground font-medium")}
                >
                  {item.label}
                </text>
                {item.sublabel && (
                  <text
                    x={xToPixel(i)}
                    y={CHART_HEIGHT - 8}
                    textAnchor="middle"
                    className={cn("text-[10px]", isActive ? "fill-primary font-semibold" : "fill-muted-foreground")}
                  >
                    {item.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div
          className="pointer-events-none absolute z-10 min-w-max -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
          style={{ left: `${tooltipLeft}%`, top: `${tooltipTop}%`, transform: `translate(-50%, calc(-100% - 10px))` }}
        >
          <p className="text-[11px] font-semibold whitespace-nowrap text-foreground">
            {normalizedLabels[activeIndex].fullLabel ??
              `${normalizedLabels[activeIndex].label}${normalizedLabels[activeIndex].sublabel ? ` · ${normalizedLabels[activeIndex].sublabel}` : ""}`}
          </p>
          <div className="mt-1 flex flex-col gap-0.5">
            {series.map((s) => {
              const value = s.values[activeIndex]
              const percent = percentOf ? Math.round((value / percentOf) * 100) : null
              return (
                <div key={s.id} className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-foreground">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  {formatValue(value)}
                  {percent !== null && <span className="font-normal text-muted-foreground">({percent}%)</span>}
                  {series.length > 1 && <span className="font-normal text-muted-foreground">{s.label}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
