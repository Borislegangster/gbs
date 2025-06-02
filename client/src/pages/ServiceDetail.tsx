"use client"

import { useParams, Link } from "react-router-dom"
import { SEO } from "../components/SEO"
import {
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  HomeIcon,
  WrenchIcon,
  Ruler,
  PaintBucket,
  HardHat,
  Hammer,
  Pencil,
} from "lucide-react"
import { useNotification } from "../contexts/NotificationContext"
import { useService } from "../hooks/useApi"
import type { JSX } from "react"

const iconMap: { [key: string]: JSX.Element } = {
  HomeIcon: <HomeIcon className="w-6 h-6" />,
  BuildingIcon: <HomeIcon className="w-6 h-6" />,
  WrenchIcon: <WrenchIcon className="w-6 h-6" />,
  HardHatIcon: <HardHat className="w-6 h-6" />,
  HammerIcon: <Hammer className="w-6 h-6" />,
  RulerIcon: <Ruler className="w-6 h-6" />,
  PaintBucketIcon: <PaintBucket className="w-6 h-6" />,
  PencilIcon: <Pencil className="w-6 h-6" />,
}

export function ServiceDetail() {
  const { slug } = useParams()
  const { data: service, loading, error } = useService(slug || "")
  const { addNotification } = useNotification()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service non trouvé</h2>
          <p className="text-gray-600 mb-6">{error || "Ce service n'existe pas ou n'est plus disponible."}</p>
          <Link to="/services" className="bg-[#3498db] text-white px-6 py-3 rounded hover:bg-blue-600 transition">
            Retour aux services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={service.title} description={service.description} image={service.image} />

      {/* Hero Section */}
      <div
        className="relative bg-[#0a1e37] text-white py-32"
        style={{
          backgroundImage: service.image
            ? `linear-gradient(rgba(10, 30, 55, 0.8), rgba(10, 30, 55, 0.8)), url(${service.image})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#3498db] flex items-center justify-center">
              {iconMap[service.icon] || <HomeIcon className="w-6 h-6" />}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">{service.title}</h1>
          <p className="max-w-2xl mx-auto text-center text-lg">{service.description}</p>
          {service.price > 0 && (
            <div className="text-center mt-6">
              <span className="text-2xl font-bold text-[#3498db]">
                À partir de{" "}
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(service.price)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {service.longDescription && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl text-[#0a1e37] font-bold mb-4">Description détaillée</h2>
                <p className="text-gray-600">{service.longDescription}</p>
              </div>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl text-[#0a1e37] font-bold mb-6">Caractéristiques</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-[#3498db] mt-1 mr-3 flex-shrink-0" />
                      <p className="text-[#0a1e37]">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process */}
            {service.process && service.process.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl text-[#0a1e37] font-bold mb-6">Notre processus</h2>
                <div className="space-y-8">
                  {service.process.map((step: any, index: number) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#3498db] text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl text-[#0a1e37] font-semibold mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl text-[#0a1e37] font-bold mb-6">Galerie</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.gallery.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`${service.title} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* CTA Card */}
            <div className="bg-[#0a1e37] text-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Intéressé par ce service ?</h3>
              <p className="mb-6">Contactez-nous pour discuter de votre projet et obtenir un devis personnalisé.</p>
              <Link
                to="/contact"
                className="bg-[#3498db] hover:bg-white hover:text-[#0a1e37] text-white px-6 py-3 rounded transition block text-center"
              >
                Demander un devis
              </Link>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl text-[#0a1e37] font-bold mb-4">Informations</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="font-semibold">{service.category}</span>
                </div>
                {service.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-semibold">{service.duration}</span>
                  </div>
                )}
                {service.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix:</span>
                    <span className="font-semibold text-[#3498db]">
                      À partir de{" "}
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(service.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* FAQ */}
            {service.faq && service.faq.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl text-[#0a1e37] font-bold mb-4">Questions fréquentes</h3>
                <div className="space-y-4">
                  {service.faq.map((item: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-[#0a1e37] mb-2">{item.question}</h4>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl text-[#0a1e37] font-bold mb-4">Contactez-nous</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-[#3498db] mr-3" />
                  <span>+237 695 674 827</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-[#3498db] mr-3" />
                  <span>Lun-Ven: 8h-18h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
