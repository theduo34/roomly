"use client"

import { useCallback, useEffect, useState } from "react"
import type { StaffRole } from "@/lib/types"

const ROLE_KEY = "roomly_role"
const TOKEN_KEY = "roomly_session_token"
const NAME_KEY = "roomly_staff_name"
const LOGIN_PATH_KEY = "roomly_login_path"

/** The staff login URL is a secret path — remember it from sign-in so logout can return there. */
export function getStoredLoginPath(): string | null {
  try {
    return localStorage.getItem(LOGIN_PATH_KEY)
  } catch {
    return null
  }
}

function readRole(): StaffRole | null {
  try {
    const value = localStorage.getItem(ROLE_KEY)
    return value === "receptionist" || value === "manager" || value === "director" ? value : null
  } catch {
    return null
  }
}

export function useRole() {
  const [role, setRole] = useState<StaffRole | null>(null)

  useEffect(() => {
    // Seed from localStorage, an external store not readable during render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(readRole())
  }, [])

  const login = useCallback((nextRole: StaffRole, name: string, loginToken: string) => {
    const token = crypto.randomUUID()
    localStorage.setItem(ROLE_KEY, nextRole)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(NAME_KEY, name)
    localStorage.setItem(LOGIN_PATH_KEY, `/${loginToken}/login`)
    setRole(nextRole)
    return token
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NAME_KEY)
    setRole(null)
  }, [])

  return { role, login, logout }
}

/** Validates a dashboard URL token against the session created at login. */
export function useProtectedSession(dashboardToken: string) {
  const [role, setRole] = useState<StaffRole | null | undefined>(undefined)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedRole = readRole()
      // Seed from localStorage, an external store not readable during render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(storedToken === dashboardToken && storedRole ? storedRole : null)
    } catch {
      setRole(null)
    }
  }, [dashboardToken])

  return role
}

/** Reads the display name saved at login, for the account menu. */
export function useStaffName() {
  const [name, setName] = useState("")

  useEffect(() => {
    try {
      // Seed from localStorage, an external store not readable during render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(localStorage.getItem(NAME_KEY) ?? "")
    } catch {
      setName("")
    }
  }, [])

  return name
}
