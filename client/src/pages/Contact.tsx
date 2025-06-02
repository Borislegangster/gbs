"use client"

import type React from "react"
import { useState } from "react"
import { SEO } from "../components/SEO"
import { useSiteSettings } from "../hooks/useApi"
import { apiService } from "../services/api"
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, SendIcon, CheckCircleIcon } from "lucide-react"

export function Contact() {
  const { data: siteSettings, loading: settingsLoading } = useSiteSettings()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await apiService.submitContact(formData)
      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      })
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi du message")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md mx-4">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0a1e37] mb-4">Message envoyé !</h2>
          <p className="text-gray-600 mb-6">
            Merci pour votre message. Notre équipe vous contactera dans les plus brefs délais.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-[#3498db] hover:bg-blue-600 text-white px-6 py-2 rounded transition"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Contact"
        description={`Contactez ${siteSettings?.site_name || "AME Construction"} pour vos projets de construction et rénovation. Notre équipe est à votre écoute pour répondre à toutes vos questions.`}
      />

      {/* Hero Section */}
      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">Contactez-Nous</h1>
          <p className="text-center max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos
            projets.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[#0a1e37]">Envoyez-nous un message</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3498db]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3498db]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3498db]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3498db]"
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    <option value="construction">Construction</option>
                    <option value="renovation">Rénovation</option>
                    <option value="architecture">Architecture</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#3498db] resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3498db] hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded transition flex items-center justify-center w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {siteSettings?.address && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <MapPinIcon className="w-10 h-10 text-[#3498db] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[#0a1e37]">Notre adresse</h3>
                  <p className="text-gray-600">
                    {siteSettings.address}
                    {siteSettings.city && (
                      <>
                        <br />
                        {siteSettings.city}
                      </>
                    )}
                  </p>
                </div>
              )}

              {(siteSettings?.phone || siteSettings?.whatsapp_number) && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <PhoneIcon className="w-10 h-10 text-[#3498db] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[#0a1e37]">Téléphone</h3>
                  {siteSettings?.phone && <p className="text-gray-600">{siteSettings.phone}</p>}
                  {siteSettings?.whatsapp_number && siteSettings.whatsapp_number !== siteSettings.phone && (
                    <p className="text-gray-600">WhatsApp: {siteSettings.whatsapp_number}</p>
                  )}
                </div>
              )}

              {siteSettings?.admin_email && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <MailIcon className="w-10 h-10 text-[#3498db] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[#0a1e37]">Email</h3>
                  <p className="text-gray-600">{siteSettings.admin_email}</p>
                </div>
              )}

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <ClockIcon className="w-10 h-10 text-[#3498db] mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-[#0a1e37]">Horaires</h3>
                <p className="text-gray-600">Lun-Ven: 8h-18h</p>
                <p className="text-gray-600">Sam: 9h-12h</p>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-[#0a1e37]">Notre localisation</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31838.70197403078!2d9.680352174184478!3d4.053492697630134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1061125fd8ac86e9%3A0x8c209e5fc42dae26!2sAkwa%2C%20Douala!5e0!3m2!1sfr!2scm!4v1742721232803!5m2!1sfr!2scm"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
