"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { apiService } from "../../services/api"
import { useNotification } from "../../contexts/NotificationContext"
import { SEO } from "../../components/SEO"
import { MailIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const { success, error } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiService.forgotPassword(email.trim())
      setIsEmailSent(true)
      success(
        "Email envoyé",
        "Si cette adresse existe dans notre base de données, un lien de réinitialisation a été envoyé.",
      )
    } catch (err: any) {
      error("Erreur", err.message || "Une erreur est survenue lors de l'envoi de l'email")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0a1e37] mb-4">Email envoyé !</h2>
            <p className="text-gray-600 mb-6">
              Un lien de réinitialisation de mot de passe a été envoyé à <strong>{email}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Le lien expirera dans 5 minutes. Vérifiez également votre dossier spam.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsEmailSent(false)
                  handleSubmit(new Event("submit") as any)
                }}
                className="w-full bg-[#3498db] text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Renvoyer l'email
              </button>
              <Link to="/login" className="block text-[#3498db] hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Mot de passe oublié - AME Construction"
        description="Réinitialisez votre mot de passe AME Construction en toute sécurité."
      />

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0a1e37]">Mot de passe oublié</h2>
          <p className="mt-2 text-gray-600">Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
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
                  Envoi en cours...
                </div>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-[#3498db] hover:underline">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
