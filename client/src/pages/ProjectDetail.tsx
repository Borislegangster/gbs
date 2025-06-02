"use client"

import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { SEO } from "../components/SEO"
import { CalendarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, BuildingIcon, UsersIcon, WrenchIcon } from "lucide-react"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

interface Project {
  id: string
  title: string
  slug: string
  description: string
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
  location: string
  start_date: string
  end_date: string
  featured_image: string
  gallery: string[]
  specifications: {
    surface: string
    duration: string
  }
  budget: number
  team_size: number
  client_name: string
  milestones: Array<{
    title: string
    date: string
    completed: boolean
  }>
}

export function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    if (slug) {
      loadProject(slug)
    }
  }, [slug])

  const loadProject = async (projectSlug: string) => {
    try {
      setLoading(true)
      const response = await apiService.getProject(projectSlug)

      if (response.success) {
        setProject(response.data)
      } else {
        addNotification("Projet non trouvé", "error")
      }
    } catch (error: any) {
      console.error("Failed to load project:", error)
      addNotification(error.message || "Erreur lors du chargement du projet", "error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Projet non trouvé</h1>
          <Link to="/projects" className="text-blue-600 hover:text-blue-800">
            Retour aux projets
          </Link>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={project.title} description={project.description} image={project.featured_image} />

      {/* Hero Section */}
      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              {project.status === "ongoing" ? (
                <div className="bg-yellow-500 text-white px-4 py-1 rounded-full flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  En cours
                </div>
              ) : project.status === "completed" ? (
                <div className="bg-green-500 text-white px-4 py-1 rounded-full flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Terminé
                </div>
              ) : project.status === "paused" ? (
                <div className="bg-orange-500 text-white px-4 py-1 rounded-full flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  En pause
                </div>
              ) : (
                <div className="bg-gray-500 text-white px-4 py-1 rounded-full flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Planification
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-center mb-4">{project.title}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {project.location && (
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {project.location}
                </div>
              )}
              {project.start_date && (
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formatDate(project.start_date)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-12">
              <img
                src={project.featured_image || "/placeholder.svg?height=400&width=600"}
                alt={project.title}
                className="w-full h-[400px] object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                }}
              />
              {project.gallery && project.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {project.gallery.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg?height=120&width=180"}
                      alt={`${project.title} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=120&width=180"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-[#0a1e37]">Description du Projet</h2>
              <p className="text-gray-600">{project.description}</p>
            </div>

            {/* Timeline */}
            {project.milestones && project.milestones.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-[#0a1e37]">Progression du Projet</h2>
                <div className="space-y-6">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.completed ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        <CheckCircleIcon
                          className={`w-5 h-5 ${milestone.completed ? "text-white" : "text-gray-400"}`}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-[#0a1e37]">{milestone.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(milestone.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Project Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-[#0a1e37]">Spécifications</h3>
              <div className="space-y-4">
                {project.specifications?.surface && (
                  <div className="flex items-center">
                    <BuildingIcon className="w-5 h-5 text-[#3498db] mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Surface</p>
                      <p className="font-semibold text-[#0a1e37]">{project.specifications.surface}</p>
                    </div>
                  </div>
                )}

                {project.team_size && (
                  <div className="flex items-center">
                    <UsersIcon className="w-5 h-5 text-[#3498db] mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Équipe</p>
                      <p className="font-semibold text-[#0a1e37]">{project.team_size} personnes</p>
                    </div>
                  </div>
                )}

                {project.specifications?.duration && (
                  <div className="flex items-center">
                    <WrenchIcon className="w-5 h-5 text-[#3498db] mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Durée</p>
                      <p className="font-semibold text-[#0a1e37]">{project.specifications.duration}</p>
                    </div>
                  </div>
                )}

                {project.budget && (
                  <div className="flex items-center">
                    <BuildingIcon className="w-5 h-5 text-[#3498db] mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-[#0a1e37]">{formatCurrency(project.budget)}</p>
                    </div>
                  </div>
                )}

                {project.client_name && (
                  <div className="flex items-center">
                    <UsersIcon className="w-5 h-5 text-[#3498db] mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-semibold text-[#0a1e37]">{project.client_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {project.status === "ongoing" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-[#0a1e37]">Progression</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avancement</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#3498db] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-[#0a1e37] text-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Intéressé par ce projet ?</h3>
              <p className="mb-4">Contactez-nous pour en savoir plus sur nos services et discuter de votre projet.</p>
              <Link
                to="/contact"
                className="bg-[#3498db] hover:bg-white hover:text-[#0a1e37] text-white px-6 py-3 rounded transition block text-center"
              >
                Obtenir un devis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
