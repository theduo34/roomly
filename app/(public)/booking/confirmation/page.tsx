import { Suspense } from "react"
import { BookingConfirmation } from "@/features/public/booking/components/booking-confirmation"

export default function BookingConfirmationPage() {
  return (
    <Suspense>
      <BookingConfirmation />
    </Suspense>
  );
}
