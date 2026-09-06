"use client"

import { useState } from "react"
import { StarIcon } from "@phosphor-icons/react/ssr"
import { formatDate } from "@/lib/utils"
import { reviews } from "@/lib/mock-data"

const PREVIEW_COUNT = 2

export function RoomReviews({ roomId }: { roomId: string }) {
  const [expanded, setExpanded] = useState(false)
  const roomReviews = reviews.filter((review) => review.roomId === roomId)

  if (roomReviews.length === 0) return null

  const average = roomReviews.reduce((sum, review) => sum + review.rating, 0) / roomReviews.length
  const visibleReviews = expanded ? roomReviews : roomReviews.slice(0, PREVIEW_COUNT)
  const hasMore = roomReviews.length > PREVIEW_COUNT

  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="font-heading text-2xl font-bold text-foreground">{average.toFixed(1)}</p>
        <div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                weight="fill"
                className={i < Math.round(average) ? "size-3.5 text-primary" : "size-3.5 text-border"}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {roomReviews.length} {roomReviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {visibleReviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading font-semibold text-primary">
                {review.guestName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{review.guestName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  weight="fill"
                  className={i < review.rating ? "size-3.5 text-primary" : "size-3.5 text-border"}
                />
              ))}
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full rounded-full border border-border py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {expanded ? "Show less" : `View more (${roomReviews.length - PREVIEW_COUNT})`}
        </button>
      )}
    </div>
  );
}
