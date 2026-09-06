import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative flex h-[360px] w-full items-end overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=80"
        alt="Terrace suite deck overlooking the water at Roomly"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/85 via-[#0d1b2a]/25 to-transparent" />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-8">
        <h1 className="max-w-xl font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
          A quiet stay, done right.
        </h1>
        <p className="mt-3 max-w-md text-base text-white/85">
          Roomly makes it simple to find your room, book it in minutes, and arrive to a stay
          that feels like it was made for you.
        </p>
        <Button asChild size="lg" className="mt-5">
          <Link href="/rooms">Browse Rooms</Link>
        </Button>
      </div>
    </section>
  );
}
