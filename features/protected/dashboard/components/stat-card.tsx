import type { IconWeight } from "@phosphor-icons/react"
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react/ssr"
import { cn } from "@/lib/utils"

type IconComponent = React.ComponentType<{ className?: string; weight?: IconWeight }>

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  trend,
}: {
  label: string
  value: string
  icon?: IconComponent
  tone?: "primary" | "success" | "destructive" | "purple"
  trend?: { direction: "up" | "down"; value: string; comparedTo: string }
}) {
  const toneClassName = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    destructive: "bg-destructive/10 text-destructive",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  }[tone]

  const TrendIcon = trend?.direction === "up" ? TrendUpIcon : TrendDownIcon

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-full", toneClassName)}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-foreground">{value}</p>
      {trend && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
              trend.direction === "up"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            <TrendIcon className="size-4" weight="bold" />
            {trend.value}
          </span>
          <span className="text-sm text-muted-foreground">{trend.comparedTo}</span>
        </div>
      )}
    </div>
  );
}
