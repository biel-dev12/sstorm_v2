"use client"

import { useAuth } from "@/components/providers/auth-provider"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Carregando...</p>
  }

  if (!user) {
    return <p>Não autenticado</p>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Bem-vindo 👋
      </h1>

      <div className="rounded-lg border p-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Cargo:</strong> {user.cargo}</p>
      </div>
    </div>
  )
}
