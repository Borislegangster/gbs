"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAdmin = false,
}) => {
  const { user, loading, hasPermission, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // Vérifier si l'utilisateur a le rôle admin ou editor
  if (!["admin", "editor"].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">Vous devez être administrateur ou éditeur pour accéder à cette interface.</p>
        <p className="text-sm text-gray-500 mt-2">
          Votre rôle actuel : <span className="font-medium">{user.role}</span>
        </p>
      </div>
    )
  }

  // Vérifier si admin requis
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">Cette section est réservée aux administrateurs uniquement.</p>
      </div>
    )
  }

  // Vérifier les permissions spécifiques
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some((permission) => hasPermission(permission))

    if (!hasRequiredPermission && !isAdmin()) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permissions insuffisantes</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p className="text-sm text-gray-500 mt-2">Permissions requises : {requiredPermissions.join(", ")}</p>
        </div>
      )
    }
  }

  return <>{children}</>
}
