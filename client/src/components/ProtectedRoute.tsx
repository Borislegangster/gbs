"use client"

import type React from "react"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerified?: boolean
}

export function ProtectedRoute({ children, requireVerified = false }: ProtectedRouteProps) {
  const { user, loading, isEmailVerified } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  if (!user) {
    // Rediriger vers la page de connexion avec l'URL actuelle en state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si la route nécessite un email vérifié et que l'email n'est pas vérifié
  if (requireVerified && !isEmailVerified) {
    return <Navigate to="/verify-email-required" replace />
  }

  return <>{children}</>
}
