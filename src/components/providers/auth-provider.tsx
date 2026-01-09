"use client"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  email: string
  cargo: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUser() {
    setLoading(true)

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      if (!res.ok) {
        setUser(null)
        return
      }

      const data = await res.json()

  
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })

  setUser(null)
  window.location.href = "/login"
}


  useEffect(() => {
    loadUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: loadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return ctx
}
