"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { apiService } from "../../services/api"
import { useNotification } from "../../contexts/NotificationContext"
import { SEO } from "../../components/SEO"
import { EyeIcon, EyeOffIcon, LockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"

export function PasswordReset() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [tokenChecking, setTokenChecking] = useState(true)

  const { success, error, warning } = useNotification()

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        warning("Token manquant", "Le lien de réinitialisation est invalide ou incomplet.")
        setTokenChecking(false)
        return
      }

      try {
        // Vérifier la validité du token
        await apiService.verifyResetToken(token)
        setTokenValid(true)
      } catch (err) {
        setTokenValid(false)
        error("Token invalide", "Le lien de réinitialisation a expiré ou est invalide.")
      } finally {
        setTokenChecking(false)
      }
    }

    verifyToken()
  }, [token, error, warning])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      error("Erreur de validation", "Les mots de passe ne correspondent pas")
      return
    }

    if (formData.password.length < 6) {
      error("Erreur de validation", "Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (!token) {
      error("Token manquant", "Le lien de réinitialisation est invalide")
      return
    }

    setIsLoading(true)

    try {
      await apiService.resetPassword(token, formData.password)
      setIsSuccess(true)
      success("Mot de passe réinitialisé", "Votre mot de passe a été réinitialisé avec succès.")

      // Redirection vers login après 3 secondes
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err: any) {
      error("Erreur de réinitialisation", err.message || "Une erreur est survenue lors de la réinitialisation")
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mx-auto"></div>
            <p className="mt-4 text-gray-600">Vérification du lien de réinitialisation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0a1e37] mb-4">Lien invalide</h2>
            <p className="text-gray-600 mb-6">Le lien de réinitialisation est invalide ou a expiré.</p>
            <Link
              to="/forgot-password"
              className="bg-[#3498db] text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors inline-block"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0a1e37] mb-4">Mot de passe réinitialisé !</h2>
            <p className="text-gray-600 mb-6">Votre mot de passe a été réinitialisé avec succès.</p>
            <p className="text-sm text-gray-500 mb-4">Vous allez être redirigé vers la page de connexion...</p>
            <Link
              to="/login"
              className="bg-[#3498db] text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors inline-block"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Réinitialiser le mot de passe - AME Construction"
        description="Créez un nouveau mot de passe pour votre compte AME Construction."
      />

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0a1e37]">Nouveau mot de passe</h2>
          <p className="mt-2 text-gray-600">Créez un nouveau mot de passe sécurisé</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                  placeholder="Confirmez votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3498db] text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Réinitialisation en cours...
                </div>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#3498db] hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
