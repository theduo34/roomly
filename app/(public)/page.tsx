import { Hero } from "@/features/public/home/components/hero"
import { ValueProps } from "@/features/public/home/components/value-props"
import { RoomTypes } from "@/features/public/home/components/room-types"
import { FeaturedRooms } from "@/features/public/home/components/featured-rooms"
import { Testimonial } from "@/features/public/home/components/testimonial"
import { CtaBanner } from "@/features/public/home/components/cta-banner"

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <RoomTypes />
      <FeaturedRooms />
      <Testimonial />
      <CtaBanner />
    </>
  );
}
