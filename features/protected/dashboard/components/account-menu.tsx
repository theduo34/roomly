"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  CaretUpDownIcon,
  GearSixIcon,
  MoonIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react/ssr"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getStoredLoginPath, useRole, useStaffName } from "@/features/auth/hooks/use-role"
import { cn } from "@/lib/utils"
import type { StaffRole } from "@/lib/types"

const roleLabels: Record<StaffRole, string> = {
  receptionist: "Receptionist",
  manager: "Manager",
  director: "Director",
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function AccountMenu({
  role,
  collapsed,
}: {
  role: StaffRole
  collapsed: boolean
}) {
  const router = useRouter()
  const { logout } = useRole()
  const name = useStaffName()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleSignOut() {
    const loginPath = getStoredLoginPath()
    logout()
    router.push(loginPath ?? "/")
  }

  const displayName = name || roleLabels[role]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-muted",
              collapsed && "md:justify-center md:px-0"
            )}
          >
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/10 font-sans text-sm font-semibold text-primary">
                {initialsOf(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
              <span className="block truncate text-sm font-semibold text-foreground">{displayName}</span>
              <span className="block truncate text-xs text-muted-foreground">{roleLabels[role]}</span>
            </span>
            <CaretUpDownIcon size={16} className={cn("shrink-0 text-muted-foreground", collapsed && "md:hidden")} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuItem onSelect={() => toast.message("Account settings are coming soon.")}>
            <UserCircleIcon size={16} />
            My Account
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.message("Settings are coming soon.")}>
            <GearSixIcon size={16} />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.message("Dark theme is coming soon.")}>
            <MoonIcon size={16} />
            Dark theme
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault()
              setConfirmOpen(true)
            }}
          >
            <SignOutIcon size={16} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to sign in again to access the staff console.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
