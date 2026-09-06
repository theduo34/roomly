import Image from "next/image"
import { ClockIcon, CoffeeIcon, MapPinLineIcon, ShieldCheckIcon } from "@phosphor-icons/react/ssr"

export function ValueProps() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pt-14 pb-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <div className="relative flex min-h-64 items-end overflow-hidden rounded-xl lg:col-span-2 lg:row-span-2">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
            alt="The harbour-front grounds at Roomly at dusk"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/85 via-[#0d1b2a]/10 to-transparent" />
          <div className="relative flex flex-col gap-2 p-6">
            <div className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
              <MapPinLineIcon className="size-4" />
            </div>
            <p className="font-heading text-lg font-semibold text-white">Prime location</p>
            <p className="max-w-xs text-sm text-white/85">
              Minutes from the harbour, the old town, and the city&apos;s best restaurants.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-xl bg-[#0d1b2a] p-6 lg:col-span-1 lg:row-span-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-primary">
            <ShieldCheckIcon className="size-4" />
          </div>
          <p className="font-heading font-semibold text-white">Free cancellation</p>
          <p className="text-sm text-white/70">
            Plans change. Cancel up to 48 hours before check-in at no cost.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClockIcon className="size-4" />
          </div>
          <p className="font-heading font-semibold text-foreground">24/7 front desk</p>
          <p className="text-sm text-muted-foreground">Arrive whenever your journey brings you.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CoffeeIcon className="size-4" />
          </div>
          <p className="font-heading font-semibold text-foreground">Breakfast included</p>
          <p className="text-sm text-muted-foreground">A full breakfast, included in every stay.</p>
        </div>
      </div>
    </section>
  );
}
