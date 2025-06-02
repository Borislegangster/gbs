"use client"

import { Link } from "react-router-dom"
import { useServices } from "../hooks/useServices"
import { useHomeContent } from "../hooks/useApi"
import { ArrowRightIcon } from "lucide-react"

export function ServicesSection() {
  const { services, loading: servicesLoading, error: servicesError } = useServices({ featured: true })
  const { data: content, loading: contentLoading, error: contentError } = useHomeContent()

  if (servicesLoading || contentLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (servicesError) {
    console.warn("Services section error:", servicesError)
  }

  if (contentError) {
    console.warn("Services content error:", contentError)
  }

  const servicesContent = content?.services || {
    title: "Nos Services",
    subtitle: "Découvrez notre gamme complète de services de construction et de rénovation",
    description: null,
    cta_text: "Voir tous nos services",
    cta_url: "/services",
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e37] mb-4">{servicesContent.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{servicesContent.subtitle}</p>
          {servicesContent.description && (
            <p className="text-gray-600 max-w-3xl mx-auto mt-4">{servicesContent.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.slice(0, 6).map((service: any) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {service.featured_image && (
                <img
                  src={service.featured_image || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#0a1e37] mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                {service.price_range && (
                  <div className="text-[#3498db] font-semibold mb-4">À partir de {service.price_range}</div>
                )}
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center text-[#3498db] hover:text-blue-600 font-medium"
                >
                  En savoir plus
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to={servicesContent.cta_url}
            className="bg-[#3498db] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
          >
            {servicesContent.cta_text}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
