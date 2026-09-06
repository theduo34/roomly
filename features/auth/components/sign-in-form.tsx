"use client"

import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { CircleNotchIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRole } from "@/features/auth/hooks/use-role"
import type { StaffRole } from "@/lib/types"

// Mock staff directory — stands in for a real accounts system.
const staffDirectory: Record<string, { role: StaffRole; name: string }> = {
  "kojo.receptionist@roomly.example": { role: "receptionist", name: "Kojo A." },
  "efua.manager@roomly.example": { role: "manager", name: "Efua B." },
  "nana.director@roomly.example": { role: "director", name: "Nana Y." },
}

const DEMO_PASSWORD = "Password123"

const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
})

type SignInValues = z.infer<typeof signInSchema>

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function SignInForm() {
  const router = useRouter()
  const { loginToken } = useParams<{ loginToken: string }>()
  const { login } = useRole()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: SignInValues) {
    // A brief pause so the loading state actually reads as "checking your details"
    await delay(600)

    const account = staffDirectory[values.email.trim().toLowerCase()]
    if (!account) {
      toast.error("We couldn't find a staff account with that email.")
      return
    }
    if (values.password !== DEMO_PASSWORD) {
      toast.warning("That password doesn't match this account.")
      return
    }

    toast.success("Signed in — taking you to your dashboard.")
    const token = login(account.role, account.name, loginToken)
    router.push(`/admin/${token}/dashboard`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@roomly.example"
          className="h-12"
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="h-12"
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <CircleNotchIcon className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        Demo accounts (password: {DEMO_PASSWORD}): kojo.receptionist@roomly.example ·
        efua.manager@roomly.example · nana.director@roomly.example
      </p>
    </form>
  );
}
