"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService } from "../services/api"

interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "editor"
  permissions: string[]
  created_at: string
  last_login_at?: string
  email_verified_at?: string
}

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<AdminUser>) => Promise<void>
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isEditor: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      if (token) {
        const response = await apiService.getProfile()
        setUser(response.user)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("admin_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await apiService.login({ email, password, rememberMe })
      localStorage.setItem("admin_token", response.token)
      setUser(response.user)
    } catch (error: any) {
      throw new Error(error.message || "Erreur de connexion")
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("admin_token")
      setUser(null)
    }
  }

  const updateProfile = async (data: Partial<AdminUser>) => {
    try {
      const response = await apiService.updateProfile(data)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === "admin") return true // Admin a tous les droits
    return user.permissions?.includes(permission) || false
  }

  const isAdmin = (): boolean => {
    return user?.role === "admin" || false
  }

  const isEditor = (): boolean => {
    return user?.role === "editor" || false
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    hasPermission,
    isAdmin,
    isEditor,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
