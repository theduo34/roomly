import { QuotesIcon, StarIcon } from "@phosphor-icons/react/ssr"

export function Testimonial() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pb-14">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-xl bg-secondary/50 px-6 py-10 text-center">
        <QuotesIcon weight="fill" className="size-8 text-primary" />
        <p className="mt-4 font-heading text-xl font-medium text-foreground sm:text-2xl">
          Easily the most relaxed check-in we&apos;ve had — the room was exactly as pictured,
          and the staff made the whole stay feel effortless.
        </p>
        <div className="mt-4 flex items-center gap-1 text-primary">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} weight="fill" className="size-4" />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Ama K. — stayed in the Regal Suite</p>
      </div>
    </section>
  );
}
