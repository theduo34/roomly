"use client"

import { useId, useState } from "react"

export type TrendSeries = {
  id: string
  label: string
  color: string // CSS color value, e.g. "var(--chart-2)"
  values: number[]
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 180
const PADDING_LEFT = 32
const PADDING_RIGHT = 16
const PADDING_TOP = 16
const PADDING_BOTTOM = 28
const Y_TICKS = 4

function niceMax(value: number): number {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

export function TrendChart({
  labels,
  series,
  formatValue = (n: number) => String(n),
  splitIndex,
}: {
  labels: string[]
  series: TrendSeries[]
  formatValue?: (value: number) => string
  /** Index up to which data is actual — points after this render as a dashed, unfilled projection. */
  splitIndex?: number
}) {
  const gradientBase = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const maxValue = niceMax(Math.max(1, ...series.flatMap((s) => s.values)))
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const stepX = labels.length > 1 ? plotWidth / (labels.length - 1) : 0
  const baselineY = PADDING_TOP + plotHeight
  const lastActual = splitIndex ?? labels.length - 1

  const yToPixel = (value: number) => PADDING_TOP + plotHeight - (value / maxValue) * plotHeight
  const xToPixel = (i: number) => PADDING_LEFT + stepX * i

  const seriesCoords = series.map((s) => ({
    ...s,
    points: s.values.map((value, i) => ({ value, x: xToPixel(i), y: yToPixel(value) })),
  }))

  const activeIndex = hoverIndex ?? labels.length - 1
  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => Math.round((maxValue / Y_TICKS) * i))

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const index = Math.round(ratio * (labels.length - 1))
    setHoverIndex(Math.min(labels.length - 1, Math.max(0, index)))
  }

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {series.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <span className="sr-only">
        {series
          .map((s) => `${s.label}: ${labels.map((l, i) => `${l} ${s.values[i]}`).join(", ")}`)
          .join(". ")}
      </span>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full touch-none"
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

        {hoverIndex !== null && (
          <line
            x1={xToPixel(hoverIndex)}
            y1={PADDING_TOP}
            x2={xToPixel(hoverIndex)}
            y2={baselineY}
            stroke="var(--border)"
            strokeWidth={1}
          />
        )}

        {seriesCoords.map((s) => {
          const actualPoints = s.points.slice(0, lastActual + 1)
          const projectedPoints = s.points.slice(lastActual)
          const actualLine = actualPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
          const projectedLine = projectedPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
          const gradientId = `${gradientBase}-${s.id}`

          return (
            <g key={s.id}>
              <path
                d={`${actualLine} L${actualPoints[actualPoints.length - 1].x},${baselineY} L${actualPoints[0].x},${baselineY} Z`}
                fill={`url(#${gradientId})`}
                stroke="none"
              />
              <path d={actualLine} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {projectedPoints.length > 1 && (
                <path
                  d={projectedLine}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="5 4"
                  opacity={0.7}
                />
              )}
              {s.points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === activeIndex ? 5 : 3}
                  fill="var(--card)"
                  stroke={s.color}
                  strokeWidth={2}
                  opacity={i > lastActual ? 0.7 : 1}
                />
              ))}
            </g>
          );
        })}

        {labels.map((label, i) => {
          const labelStep = Math.ceil(labels.length / 7)
          if (i % labelStep !== 0 && i !== labels.length - 1) return null
          return (
            <text
              key={label + i}
              x={xToPixel(i)}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">{labels[activeIndex]}</span>
        {series.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5">
            {series.length > 1 && <span className="size-1.5 rounded-full" style={{ backgroundColor: s.color }} />}
            <span className="font-semibold text-foreground">{formatValue(s.values[activeIndex])}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
