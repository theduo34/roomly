import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CtaBanner() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pb-14">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-[#0d1b2a] px-6 py-12 text-center">
        <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
          Ready for a quiet stay?
        </h2>
        <p className="max-w-md text-white/80">
          Check availability and book your room in minutes — no calls, no waiting.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/rooms">Browse Rooms</Link>
        </Button>
      </div>
    </section>
  );
}
