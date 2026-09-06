import type { IconWeight } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type IconComponent = React.ComponentType<{ className?: string; weight?: IconWeight }>

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string
  value: string
  icon: IconComponent
  tone?: "primary" | "success" | "destructive" | "purple"
}) {
  const toneClassName = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    destructive: "bg-destructive/10 text-destructive",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  }[tone]

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("flex size-8 items-center justify-center rounded-full", toneClassName)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
