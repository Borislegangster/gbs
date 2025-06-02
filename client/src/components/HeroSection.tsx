"use client"
import { useNavigate } from "react-router-dom"
import { useHomeContent } from "../hooks/useApi"

export function HeroSection() {
  const navigate = useNavigate()
  const { data: content, loading, error } = useHomeContent()

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  if (error) {
    console.warn("Hero section error:", error)
  }

  const heroContent = content?.hero || {
    title: "Construisons l'avenir ensemble",
    subtitle: "AME Construction, votre partenaire de confiance pour tous vos projets de construction et de rénovation",
    background_image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1",
    cta_text: "Obtenir un devis",
    cta_url: "/contact",
    secondary_cta_text: "Voir nos projets",
    secondary_cta_url: "/projects",
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 30, 55, 0.8), rgba(10, 30, 55, 0.8)), url(${heroContent.background_image})`,
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{heroContent.title}</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">{heroContent.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(heroContent.cta_url)}
              className="bg-[#3498db] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              {heroContent.cta_text}
            </button>
            <button
              onClick={() => navigate(heroContent.secondary_cta_url)}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#0a1e37] transition-colors"
            >
              {heroContent.secondary_cta_text}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  )
}
