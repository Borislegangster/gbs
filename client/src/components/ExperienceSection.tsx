"use client"

import { useNavigate } from "react-router-dom"
import { useHomeContent } from "../hooks/useApi"

export function ExperienceSection() {
  const navigate = useNavigate()
  const { data: content, loading, error } = useHomeContent()

  if (loading) {
    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (error) {
    console.warn("Experience section error:", error)
  }

  const experienceContent = content?.experience || {
    title: "20 Ans D'expériences",
    subtitle: "Notre Histoire et Notre Expérience",
    description:
      "Depuis plus de deux décennies, notre entreprise s'est imposée comme un leader dans le secteur de la construction. Nous avons acquis une expertise inégalée dans la réalisation de projets de toutes tailles, des résidences privées aux grands complexes commerciaux.\n\nNotre équipe de professionnels qualifiés s'engage à fournir des services de construction de la plus haute qualité, en respectant les délais et les budgets convenus.",
    images: ["/assets/ex1.jpg", "/assets/ex2.jfif", "/assets/ex3.jfif", "/assets/ex4.jfif"],
    cta_text: "En Savoir Plus",
    cta_url: "/about",
  }

  const images =
    experienceContent.images && experienceContent.images.length > 0
      ? experienceContent.images
      : ["/assets/ex1.jpg", "/assets/ex2.jfif", "/assets/ex3.jfif", "/assets/ex4.jfif"]

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-4 mb-8 md:mb-0">
            {images.slice(0, 4).map((image, index) => (
              <div key={index}>
                <img
                  src={image || `/placeholder.svg?height=160&width=200`}
                  alt={`Experience ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=160&width=200`
                  }}
                />
              </div>
            ))}
          </div>
          <div className="w-full md:w-1/2 md:pl-12">
            <div className="border-l-4 border-[#3498db] pl-4 mb-4">
              <span className="text-[#3498db] font-semibold">{experienceContent.subtitle}</span>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-[#0a1e37]">{experienceContent.title}</h2>
            <div className="text-gray-600 mb-8 space-y-4">
              {experienceContent.description ? (
                experienceContent.description
                  .split("\n")
                  .map((paragraph, index) => paragraph.trim() && <p key={index}>{paragraph.trim()}</p>)
              ) : (
                <p>Contenu d'expérience non disponible.</p>
              )}
            </div>
            <button
              onClick={() => navigate(experienceContent.cta_url)}
              className="bg-[#3498db] hover:bg-[#0a1e37] text-white px-6 py-3 rounded transition"
            >
              {experienceContent.cta_text}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
