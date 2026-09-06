import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"

export function SectionLinkCard({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string
  href: string
  linkLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      {children}
      <Link
        href={href}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        {linkLabel}
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}
