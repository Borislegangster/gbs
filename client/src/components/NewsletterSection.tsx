"use client"

import type React from "react"
import { useState } from "react"
import { apiService } from "../services/api"
import { CheckCircleIcon } from "lucide-react"
import { useHomeContent } from "../hooks/useApi"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: content, loading } = useHomeContent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await apiService.subscribeNewsletter(email)
      setIsSubscribed(true)
      setEmail("")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  const newsletterContent = content?.newsletter || {}

  if (isSubscribed) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl text-[#0a1e37] font-bold mb-4">Inscription réussie !</h3>
          <p className="text-gray-600 mb-6">
            Merci de vous être abonné à notre newsletter. Vous recevrez bientôt nos dernières actualités.
          </p>
          <button onClick={() => setIsSubscribed(false)} className="text-[#3498db] hover:underline">
            S'abonner avec une autre adresse
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl text-[#0a1e37] font-bold mb-2">{newsletterContent.title || "Newsletter"}</h3>
            <p className="text-gray-600">
              {newsletterContent.description ||
                "Restez informé de nos dernières actualités et projets. Abonnez-vous à notre newsletter."}
            </p>
          </div>
          <div className="w-full md:w-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
            )}
            <form className="flex" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder={newsletterContent.placeholder_text || "Votre email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-[#3498db] w-full md:w-64"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3498db] hover:bg-[#0a1e37] disabled:bg-gray-400 text-white px-4 py-2 transition"
              >
                {isSubmitting ? "..." : newsletterContent.button_text || "Soumettre"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
