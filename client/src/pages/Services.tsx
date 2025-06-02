import { Link } from "react-router-dom"
import { SEO } from "../components/SEO"
import { BuildingIcon, HomeIcon, WrenchIcon, Pencil, HardHat, Ruler, PaintBucket, Hammer } from "lucide-react"
import { useServices } from "../hooks/useApi"
import { useNotification } from "../contexts/NotificationContext"

const iconMap: { [key: string]: JSX.Element } = {
  HomeIcon: <HomeIcon className="w-6 h-6" />,
  BuildingIcon: <BuildingIcon className="w-6 h-6" />,
  WrenchIcon: <WrenchIcon className="w-6 h-6" />,
  HardHatIcon: <HardHat className="w-6 h-6" />,
  HammerIcon: <Hammer className="w-6 h-6" />,
  RulerIcon: <Ruler className="w-6 h-6" />,
  PaintBucketIcon: <PaintBucket className="w-6 h-6" />,
  PencilIcon: <Pencil className="w-6 h-6" />,
}

const categoryIcons: { [key: string]: JSX.Element } = {
  Construction: <BuildingIcon className="w-12 h-12" />,
  Rénovation: <WrenchIcon className="w-12 h-12" />,
  "Études et Conception": <Pencil className="w-12 h-12" />,
  Consultation: <Pencil className="w-12 h-12" />,
}

export function Services() {
  const { data: services, loading, error } = useServices()
  const { addNotification } = useNotification()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    addNotification("Erreur lors du chargement des services", "error")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600">Impossible de charger les services pour le moment.</p>
        </div>
      </div>
    )
  }

  // Grouper les services par catégorie
  const servicesByCategory =
    services?.reduce((acc: any, service: any) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    }, {}) || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Nos Services de Construction"
        description="Découvrez notre gamme complète de services en construction, rénovation et architecture. Des solutions professionnelles adaptées à tous vos projets."
        image="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1"
      />

      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">Nos Prestations de Services</h1>
          <p className="text-center mt-4 max-w-2xl mx-auto">
            Découvrez notre gamme complète de prestations dans le domaine de la construction et de la rénovation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="space-y-16">
          {Object.entries(servicesByCategory).map(([category, categoryServices]: [string, any]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-[#3498db] mr-4">
                  {categoryIcons[category] || <BuildingIcon className="w-12 h-12" />}
                </div>
                <h2 className="text-2xl text-[#0a1e37] font-bold">{category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryServices.map((service: any) => (
                  <div key={service.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="aspect-video relative">
                      <img
                        src={service.image || "/placeholder.svg?height=200&width=300"}
                        alt={service.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-full bg-[#3498db] text-white flex items-center justify-center mb-4">
                        {iconMap[service.icon] || <HomeIcon className="w-6 h-6" />}
                      </div>
                      <h3 className="text-xl text-[#0a1e37] font-semibold mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        {service.price > 0 && (
                          <span className="text-[#3498db] font-semibold">
                            À partir de{" "}
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                              service.price,
                            )}
                          </span>
                        )}
                        {service.duration && <span className="text-gray-500 text-sm">Durée: {service.duration}</span>}
                      </div>
                      <Link
                        to={`/services/${service.slug}`}
                        className="text-[#3498db] hover:text-blue-600 font-medium inline-flex items-center"
                      >
                        En savoir plus
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-[#0a1e37] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Besoin d'un service sur mesure ?</h2>
          <p className="mb-6">
            Notre équipe est à votre disposition pour étudier vos besoins spécifiques et vous proposer une solution
            adaptée.
          </p>
          <Link
            to="/contact"
            className="bg-[#3498db] hover:bg-[#ffffff] hover:text-[#0a1e37] text-white px-8 py-3 rounded inline-block transition"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
