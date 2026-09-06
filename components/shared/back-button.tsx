"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr"

export function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary"
    >
      <ArrowLeftIcon className="size-4" />
    </button>
  );
}
