import { MapPinIcon, NavigationArrowIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"

const HOTEL_NAME = "Roomly"
const HOTEL_ADDRESS = "12 Harbour Road, Accra"
const query = encodeURIComponent(`${HOTEL_NAME}, ${HOTEL_ADDRESS}`)
const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`

export function HotelLocationMap() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border">
      <div className="relative min-h-52 flex-1">
        <iframe
          title={`Map showing ${HOTEL_NAME}'s location`}
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <MapPinIcon weight="fill" className="size-5" />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 bg-card p-4">
        <div>
          <p className="font-medium text-foreground">{HOTEL_NAME}</p>
          <p className="text-sm text-muted-foreground">{HOTEL_ADDRESS}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <NavigationArrowIcon className="size-3.5" />
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
}
