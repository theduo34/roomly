"use client"

type Segment = {
  id: string
  label: string
  value: number
  color: string // CSS color value, e.g. "var(--chart-2)"
}

const SIZE = 160
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 5

export function DonutChart({
  segments,
  centerLabel,
}: {
  segments: Segment[]
  centerLabel: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  let cumulative = 0

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-hidden="true">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          {total > 0 &&
            segments
              .filter((s) => s.value > 0)
              .map((segment) => {
                const arcLength = Math.max(0, (segment.value / total) * CIRCUMFERENCE - GAP)
                const offset = (cumulative / total) * CIRCUMFERENCE
                cumulative += segment.value
                return (
                  <circle
                    key={segment.id}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${arcLength} ${CIRCUMFERENCE - arcLength}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                  />
                );
              })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.value} {segment.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
