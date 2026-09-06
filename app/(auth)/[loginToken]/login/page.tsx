import { notFound } from "next/navigation"
import { SignInForm } from "@/features/auth/components/sign-in-form"

export default async function LoginPage(props: PageProps<"/[loginToken]/login">) {
  const { loginToken } = await props.params;
  if (loginToken !== process.env.LOGIN_TOKEN) notFound();

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative flex flex-col justify-center overflow-hidden bg-[#0d1b2a] px-6 py-16 sm:px-12 lg:px-16">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, var(--pc-gold) 0, var(--pc-gold) 1px, transparent 1px, transparent 40px)",
          }}
        />
        <div className="relative">
          <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">Staff Console</p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white sm:text-5xl">Roomly</h1>
          <p className="mt-6 max-w-sm text-white/70">
            Bookings, guests, and everything behind the front desk — in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="font-heading text-3xl font-bold text-foreground">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to manage the property.
          </p>
          <div className="mt-8">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
