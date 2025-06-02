"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "../services/api"
import { useNotification } from "./NotificationContext"

interface User {
  id: number
  name: string
  email: string
  phone?: string
  email_verified_at?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>
  register: (userData: { name: string; email: string; phone?: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  isEmailVerified: boolean
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { success, error, warning, info } = useNotification()

  useEffect(() => {
    checkAuth()
  }, [])

  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  }

  const setToken = (token: string, remember = false) => {
    if (remember) {
      localStorage.setItem("token", token)
      sessionStorage.removeItem("token")
    } else {
      sessionStorage.setItem("token", token)
      localStorage.removeItem("token")
    }
  }

  const removeToken = () => {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
  }

  const checkAuth = async () => {
    try {
      const token = getToken()
      if (token) {
        const userData = await apiService.getCurrentUser()
        setUser(userData)

        // Vérifier si l'email n'est pas vérifié
        if (!userData.email_verified_at) {
          warning(
            "Email non vérifié",
            "Veuillez vérifier votre adresse email. Un nouveau lien de vérification va être envoyé.",
          )
          // Envoyer automatiquement un nouveau lien de vérification
          try {
            await apiService.resendVerificationEmail()
            info("Lien de vérification envoyé", "Vérifiez votre boîte email.")
          } catch (err) {
            console.error("Erreur envoi vérification:", err)
          }
        }
      }
    } catch (err) {
      removeToken()
      console.error("Auth check failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      const response = await apiService.login(credentials)

      setToken(response.token, credentials.rememberMe)
      setUser(response.user)

      success("Connexion réussie", `Bienvenue ${response.user.name} !`)

      // Vérifier si l'email n'est pas vérifié
      if (!response.user.email_verified_at) {
        warning("Email non vérifié", "Un lien de vérification a été envoyé à votre adresse email.")
        // Le backend envoie automatiquement un lien si l'email n'est pas vérifié
      }
    } catch (err: any) {
      error("Erreur de connexion", err.message || "Email ou mot de passe incorrect")
      throw err
    }
  }

  const register = async (userData: { name: string; email: string; phone?: string; password: string }) => {
    try {
      const response = await apiService.register(userData)

      // Auto-connexion après inscription
      setToken(response.token, false) // Par défaut, pas de "remember me" à l'inscription
      setUser(response.user)

      success("Inscription réussie !", "Votre compte a été créé. Un email de vérification a été envoyé.")

      info("Vérifiez votre email", "Cliquez sur le lien dans l'email pour activer votre compte.")
    } catch (err: any) {
      error("Erreur d'inscription", err.message || "Une erreur est survenue lors de l'inscription")
      throw err
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
      removeToken()
      setUser(null)
      success("Déconnexion réussie", "À bientôt !")
    } catch (err) {
      // Même en cas d'erreur, on déconnecte localement
      removeToken()
      setUser(null)
      error("Erreur lors de la déconnexion", "Vous avez été déconnecté localement.")
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(userData)
      setUser(updatedUser)
      success("Profil mis à jour", "Vos informations ont été sauvegardées.")
    } catch (err: any) {
      error("Erreur de mise à jour", err.message || "Impossible de mettre à jour le profil")
      throw err
    }
  }

  const resendVerificationEmail = async () => {
    try {
      await apiService.resendVerificationEmail()
      success("Email envoyé", "Un nouveau lien de vérification a été envoyé.")
    } catch (err: any) {
      error("Erreur d'envoi", err.message || "Impossible d'envoyer l'email de vérification")
      throw err
    }
  }

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await apiService.changePassword(data)
      success("Mot de passe modifié", "Votre mot de passe a été mis à jour avec succès.")
    } catch (err: any) {
      error("Erreur de modification", err.message || "Impossible de modifier le mot de passe")
      throw err
    }
  }

  const isEmailVerified = Boolean(user?.email_verified_at)

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    resendVerificationEmail,
    isEmailVerified,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
